-- Master lists for property categories and property types. Idempotent.
SET XACT_ABORT ON;
IF OBJECT_ID(N'drishyam.Masters',N'U') IS NULL
CREATE TABLE drishyam.Masters(
 id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
 kind VARCHAR(20) NOT NULL CHECK(kind IN('category','type')),
 name NVARCHAR(50) NOT NULL,
 active BIT NOT NULL DEFAULT 1,
 createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
 CONSTRAINT UQ_Masters_KindName UNIQUE(kind,name)
);
GO
-- The first version only allowed three fixed categories. Any category is allowed now.
DECLARE @constraint SYSNAME=(SELECT TOP 1 cc.name FROM sys.check_constraints cc
 WHERE cc.parent_object_id=OBJECT_ID(N'drishyam.Properties') AND cc.definition LIKE N'%Residential%');
DECLARE @drop NVARCHAR(400)=N'ALTER TABLE drishyam.Properties DROP CONSTRAINT '+QUOTENAME(@constraint);
IF @constraint IS NOT NULL EXEC sys.sp_executesql @drop;
GO
-- Starting values, plus anything the existing properties already use.
INSERT drishyam.Masters(kind,name)
SELECT 'category',v.name FROM (VALUES(N'Residential'),(N'Commercial'),(N'Land')) v(name)
WHERE NOT EXISTS(SELECT 1 FROM drishyam.Masters m WHERE m.kind='category' AND m.name=v.name);
INSERT drishyam.Masters(kind,name)
SELECT 'type',v.name FROM (VALUES(N'Apartment'),(N'Villa / Bungalow'),(N'Office'),(N'Shop / Showroom'),(N'Industrial'),(N'Land / Plot')) v(name)
WHERE NOT EXISTS(SELECT 1 FROM drishyam.Masters m WHERE m.kind='type' AND m.name=v.name);
INSERT drishyam.Masters(kind,name)
SELECT DISTINCT 'category',p.category FROM drishyam.Properties p
WHERE NOT EXISTS(SELECT 1 FROM drishyam.Masters m WHERE m.kind='category' AND m.name=p.category);
INSERT drishyam.Masters(kind,name)
SELECT DISTINCT 'type',p.type FROM drishyam.Properties p
WHERE NOT EXISTS(SELECT 1 FROM drishyam.Masters m WHERE m.kind='type' AND m.name=p.type);
GO
CREATE OR ALTER PROCEDURE drishyam.usp_Masters_List AS
BEGIN
 SET NOCOUNT ON;
 SELECT m.id,m.kind,m.name,m.active,
 CASE m.kind WHEN 'category' THEN (SELECT COUNT(*) FROM drishyam.Properties p WHERE p.category=m.name)
 ELSE (SELECT COUNT(*) FROM drishyam.Properties p WHERE p.type=m.name) END AS used
 FROM drishyam.Masters m ORDER BY m.kind,m.name;
END;
GO
CREATE OR ALTER PROCEDURE drishyam.usp_Master_Save @Payload NVARCHAR(MAX),@ActorId UNIQUEIDENTIFIER=NULL AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 DECLARE @Id UNIQUEIDENTIFIER=TRY_CONVERT(UNIQUEIDENTIFIER,JSON_VALUE(@Payload,'$.id'));
 DECLARE @Kind VARCHAR(20)=JSON_VALUE(@Payload,'$.kind');
 DECLARE @Name NVARCHAR(50)=LTRIM(RTRIM(JSON_VALUE(@Payload,'$.name')));
 DECLARE @Active BIT=CASE JSON_VALUE(@Payload,'$.active') WHEN 'false' THEN 0 ELSE 1 END;
 IF @Kind NOT IN('category','type') OR @Name IS NULL OR @Name=N'' THROW 51000,'A kind and a name are required.',1;
 BEGIN TRANSACTION;
 IF @Id IS NOT NULL AND EXISTS(SELECT 1 FROM drishyam.Masters WITH(UPDLOCK,HOLDLOCK) WHERE id=@Id)
 BEGIN
  DECLARE @Old NVARCHAR(50)=(SELECT name FROM drishyam.Masters WHERE id=@Id);
  UPDATE drishyam.Masters SET name=@Name,active=@Active WHERE id=@Id;
  IF @Old<>@Name COLLATE Latin1_General_CS_AS
  BEGIN
   IF @Kind='category' UPDATE drishyam.Properties SET category=@Name WHERE category=@Old;
   ELSE UPDATE drishyam.Properties SET type=@Name WHERE type=@Old;
  END;
 END
 ELSE INSERT drishyam.Masters(kind,name,active) VALUES(@Kind,@Name,@Active);
 IF @ActorId IS NOT NULL INSERT drishyam.AuditLogs(userId,action,entityId) VALUES(@ActorId,N'master.saved',@Name);
 COMMIT;
END;
GO
CREATE OR ALTER PROCEDURE drishyam.usp_Master_Delete @Id UNIQUEIDENTIFIER,@ActorId UNIQUEIDENTIFIER=NULL AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 DECLARE @Kind VARCHAR(20),@Name NVARCHAR(50);
 SELECT @Kind=kind,@Name=name FROM drishyam.Masters WHERE id=@Id;
 IF @Kind IS NULL RETURN;
 IF (@Kind='category' AND EXISTS(SELECT 1 FROM drishyam.Properties WHERE category=@Name))
 OR (@Kind='type' AND EXISTS(SELECT 1 FROM drishyam.Properties WHERE type=@Name))
  THROW 51011,'This entry is used by properties.',1;
 DELETE FROM drishyam.Masters WHERE id=@Id;
 IF @ActorId IS NOT NULL INSERT drishyam.AuditLogs(userId,action,entityId) VALUES(@ActorId,N'master.deleted',@Name);
END;
GO
