-- Drishyam Realty SQL Server schema. SQL Server 2016 SP1+; compatibility level 130+.
-- Idempotent application setup. No unrelated tables or schemas are modified.
SET XACT_ABORT ON;
IF SCHEMA_ID(N'drishyam') IS NULL EXEC(N'CREATE SCHEMA drishyam');
GO
IF OBJECT_ID(N'drishyam.AdminUsers',N'U') IS NULL
CREATE TABLE drishyam.AdminUsers(
 id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
 email NVARCHAR(200) NOT NULL UNIQUE, name NVARCHAR(100) NOT NULL,
 passwordHash NVARCHAR(100) NOT NULL, role VARCHAR(10) NOT NULL DEFAULT 'EDITOR' CHECK(role IN('ADMIN','EDITOR')),
 active BIT NOT NULL DEFAULT 1, createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
IF OBJECT_ID(N'drishyam.AdminSessions',N'U') IS NULL
CREATE TABLE drishyam.AdminSessions(
 tokenHash NVARCHAR(64) NOT NULL PRIMARY KEY, userId UNIQUEIDENTIFIER NOT NULL REFERENCES drishyam.AdminUsers(id),
 expiresAt DATETIME2 NOT NULL, createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
IF OBJECT_ID(N'drishyam.Properties',N'U') IS NULL
CREATE TABLE drishyam.Properties(
 id NVARCHAR(70) NOT NULL PRIMARY KEY, slug NVARCHAR(150) NOT NULL UNIQUE,
 title NVARCHAR(200) NOT NULL, description NVARCHAR(MAX) NOT NULL,
 category NVARCHAR(30) NOT NULL CHECK(category IN(N'Residential',N'Commercial',N'Land')),
 type NVARCHAR(50) NOT NULL, listingType NVARCHAR(20) NOT NULL DEFAULT 'Sale',
 location NVARCHAR(200) NOT NULL, address NVARCHAR(500) NULL,
 price DECIMAL(16,2) NOT NULL CHECK(price>0), currency CHAR(3) NOT NULL DEFAULT 'INR',
 area FLOAT NOT NULL CHECK(area>0), carpetArea FLOAT NULL, plotArea FLOAT NULL,
 bedrooms INT NOT NULL DEFAULT 0 CHECK(bedrooms>=0), bathrooms INT NOT NULL DEFAULT 0 CHECK(bathrooms>=0),
 balconies INT NULL, parking INT NULL, furnishing NVARCHAR(30) NOT NULL DEFAULT N'Unfurnished',
 possession NVARCHAR(40) NOT NULL DEFAULT N'Ready to move',
 status NVARCHAR(20) NOT NULL DEFAULT N'Available' CHECK(status IN(N'Available',N'Sold',N'Inactive',N'Archived')),
 condition NVARCHAR(20) NOT NULL DEFAULT N'New', featured BIT NOT NULL DEFAULT 0,
 showOnBuy BIT NOT NULL DEFAULT 1, showOnSell BIT NOT NULL DEFAULT 1,
 floor NVARCHAR(100) NULL, facing NVARCHAR(50) NULL, age NVARCHAR(100) NULL,
 latitude FLOAT NULL CHECK(latitude BETWEEN -90 AND 90), longitude FLOAT NULL CHECK(longitude BETWEEN -180 AND 180),
 videoUrl NVARCHAR(1000) NULL, documentation NVARCHAR(MAX) NULL,
 landmarksJson NVARCHAR(MAX) NOT NULL DEFAULT N'[]' CHECK(ISJSON(landmarksJson)=1),
 demo BIT NOT NULL DEFAULT 0, createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(), updatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
IF OBJECT_ID(N'drishyam.PropertyImages',N'U') IS NULL
CREATE TABLE drishyam.PropertyImages(
 id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
 propertyId NVARCHAR(70) NOT NULL REFERENCES drishyam.Properties(id) ON DELETE CASCADE,
 url NVARCHAR(1000) NOT NULL, alt NVARCHAR(300) NOT NULL DEFAULT N'', position INT NOT NULL DEFAULT 0
);
IF OBJECT_ID(N'drishyam.PropertyAmenities',N'U') IS NULL
CREATE TABLE drishyam.PropertyAmenities(
 propertyId NVARCHAR(70) NOT NULL REFERENCES drishyam.Properties(id) ON DELETE CASCADE,
 name NVARCHAR(100) NOT NULL, PRIMARY KEY(propertyId,name)
);
IF OBJECT_ID(N'drishyam.Enquiries',N'U') IS NULL
CREATE TABLE drishyam.Enquiries(
 id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY, idempotencyKey NVARCHAR(100) NOT NULL UNIQUE,
 name NVARCHAR(100) NOT NULL, phone NVARCHAR(30) NOT NULL, email NVARCHAR(200) NULL,
 type NVARCHAR(50) NOT NULL, category NVARCHAR(30) NOT NULL, message NVARCHAR(3000) NULL, contactTime NVARCHAR(100) NULL,
 consent BIT NOT NULL CHECK(consent=1), propertyId NVARCHAR(70) NULL REFERENCES drishyam.Properties(id),
 propertyTitle NVARCHAR(200) NULL, propertyCategory NVARCHAR(100) NULL, propertyUrl NVARCHAR(1000) NULL,
 source NVARCHAR(500) NOT NULL, action NVARCHAR(100) NOT NULL,
 status NVARCHAR(30) NOT NULL DEFAULT N'New', notes NVARCHAR(MAX) NOT NULL DEFAULT N'',
 notificationStatus NVARCHAR(20) NOT NULL DEFAULT N'Pending',
 createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(), updatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
IF OBJECT_ID(N'drishyam.Testimonials',N'U') IS NULL
CREATE TABLE drishyam.Testimonials(
 id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY, name NVARCHAR(100) NOT NULL,
 type NVARCHAR(20) NOT NULL, quote NVARCHAR(2000) NOT NULL, location NVARCHAR(200) NOT NULL,
 rating INT NULL CHECK(rating BETWEEN 1 AND 5), image NVARCHAR(1000) NULL, videoUrl NVARCHAR(1000) NULL,
 approved BIT NOT NULL DEFAULT 0, createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
IF OBJECT_ID(N'drishyam.SiteSettings',N'U') IS NULL
CREATE TABLE drishyam.SiteSettings(
 [key] NVARCHAR(100) NOT NULL PRIMARY KEY, value NVARCHAR(MAX) NOT NULL CHECK(ISJSON(value)=1), updatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
IF OBJECT_ID(N'drishyam.SeoMetadata',N'U') IS NULL
CREATE TABLE drishyam.SeoMetadata(
 path NVARCHAR(200) NOT NULL PRIMARY KEY, title NVARCHAR(200) NOT NULL, description NVARCHAR(1000) NOT NULL,
 propertyId NVARCHAR(70) NULL REFERENCES drishyam.Properties(id)
);
IF OBJECT_ID(N'drishyam.RateLimits',N'U') IS NULL
CREATE TABLE drishyam.RateLimits([key] NVARCHAR(200) NOT NULL PRIMARY KEY, count INT NOT NULL DEFAULT 1, resetAt DATETIME2 NOT NULL);
IF OBJECT_ID(N'drishyam.AuditLogs',N'U') IS NULL
CREATE TABLE drishyam.AuditLogs(id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
 userId UNIQUEIDENTIFIER NULL REFERENCES drishyam.AdminUsers(id), action NVARCHAR(100) NOT NULL,
 entityId NVARCHAR(100) NULL, createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME());
GO
IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'drishyam.Properties') AND name=N'IX_Properties_Discovery')
CREATE INDEX IX_Properties_Discovery ON drishyam.Properties(status,category,location,price) INCLUDE(type,bedrooms,area);
IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'drishyam.PropertyImages') AND name=N'IX_PropertyImages_Position')
CREATE INDEX IX_PropertyImages_Position ON drishyam.PropertyImages(propertyId,position);
IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'drishyam.Enquiries') AND name=N'IX_Enquiries_Status')
CREATE INDEX IX_Enquiries_Status ON drishyam.Enquiries(status,createdAt DESC);
IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'drishyam.Enquiries') AND name=N'IX_Enquiries_Property')
CREATE INDEX IX_Enquiries_Property ON drishyam.Enquiries(propertyId);
GO
CREATE OR ALTER PROCEDURE drishyam.usp_Health AS
BEGIN SET NOCOUNT ON; SELECT CAST(1 AS BIT) AS ok, DB_NAME() AS databaseName; END;
GO
CREATE OR ALTER PROCEDURE drishyam.usp_Properties_List @IncludeUnavailable BIT=0 AS
BEGIN
 SET NOCOUNT ON;
 SELECT p.*,
 (SELECT url FROM drishyam.PropertyImages WHERE propertyId=p.id ORDER BY position FOR JSON PATH) AS imagesJson,
 (SELECT name FROM drishyam.PropertyAmenities WHERE propertyId=p.id ORDER BY name FOR JSON PATH) AS amenitiesJson
 FROM drishyam.Properties p WHERE @IncludeUnavailable=1 OR p.status=N'Available' ORDER BY p.createdAt DESC;
END;
GO
CREATE OR ALTER PROCEDURE drishyam.usp_Property_Save @Payload NVARCHAR(MAX),@ActorId UNIQUEIDENTIFIER=NULL AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 IF ISJSON(@Payload)<>1 THROW 51000,'Invalid property data.',1;
 DECLARE @Id NVARCHAR(70)=JSON_VALUE(@Payload,'$.id');
 DECLARE @Title NVARCHAR(200)=JSON_VALUE(@Payload,'$.title');
 IF @Id IS NULL OR @Title IS NULL THROW 51000,'Property ID and title are required.',1;
 BEGIN TRANSACTION;
 IF EXISTS(SELECT 1 FROM drishyam.Properties WITH(UPDLOCK,HOLDLOCK) WHERE id=@Id)
 UPDATE drishyam.Properties SET
 slug=JSON_VALUE(@Payload,'$.slug'),title=@Title,description=JSON_VALUE(@Payload,'$.description'),
 category=JSON_VALUE(@Payload,'$.category'),type=JSON_VALUE(@Payload,'$.type'),location=JSON_VALUE(@Payload,'$.location'),
 address=JSON_VALUE(@Payload,'$.address'),price=CONVERT(DECIMAL(16,2),JSON_VALUE(@Payload,'$.price')),
 area=CONVERT(FLOAT,JSON_VALUE(@Payload,'$.area')),bedrooms=CONVERT(INT,JSON_VALUE(@Payload,'$.bedrooms')),
 bathrooms=CONVERT(INT,JSON_VALUE(@Payload,'$.bathrooms')),furnishing=JSON_VALUE(@Payload,'$.furnishing'),
 possession=JSON_VALUE(@Payload,'$.possession'),status=JSON_VALUE(@Payload,'$.status'),condition=JSON_VALUE(@Payload,'$.condition'),
 featured=CASE JSON_VALUE(@Payload,'$.featured') WHEN 'true' THEN 1 ELSE 0 END,
 demo=CASE JSON_VALUE(@Payload,'$.demo') WHEN 'true' THEN 1 ELSE 0 END,
 showOnBuy=CASE JSON_VALUE(@Payload,'$.showOnBuy') WHEN 'false' THEN 0 ELSE 1 END,
 showOnSell=CASE JSON_VALUE(@Payload,'$.showOnSell') WHEN 'false' THEN 0 ELSE 1 END,
 carpetArea=TRY_CONVERT(FLOAT,JSON_VALUE(@Payload,'$.carpetArea')),plotArea=TRY_CONVERT(FLOAT,JSON_VALUE(@Payload,'$.plotArea')),
 balconies=TRY_CONVERT(INT,JSON_VALUE(@Payload,'$.balconies')),parking=TRY_CONVERT(INT,JSON_VALUE(@Payload,'$.parking')),
 floor=JSON_VALUE(@Payload,'$.floor'),facing=JSON_VALUE(@Payload,'$.facing'),age=JSON_VALUE(@Payload,'$.age'),
 latitude=TRY_CONVERT(FLOAT,JSON_VALUE(@Payload,'$.latitude')),longitude=TRY_CONVERT(FLOAT,JSON_VALUE(@Payload,'$.longitude')),
 videoUrl=JSON_VALUE(@Payload,'$.videoUrl'),documentation=JSON_VALUE(@Payload,'$.documentation'),
 landmarksJson=COALESCE(JSON_QUERY(@Payload,'$.landmarks'),N'[]'),updatedAt=SYSUTCDATETIME()
 WHERE id=@Id;
 ELSE
 INSERT drishyam.Properties(id,slug,title,description,category,type,location,address,price,area,bedrooms,bathrooms,
 furnishing,possession,status,condition,featured,demo,showOnBuy,showOnSell,carpetArea,plotArea,balconies,parking,floor,facing,age,latitude,longitude,videoUrl,documentation,landmarksJson)
 SELECT @Id,JSON_VALUE(@Payload,'$.slug'),@Title,JSON_VALUE(@Payload,'$.description'),JSON_VALUE(@Payload,'$.category'),
 JSON_VALUE(@Payload,'$.type'),JSON_VALUE(@Payload,'$.location'),JSON_VALUE(@Payload,'$.address'),
 CONVERT(DECIMAL(16,2),JSON_VALUE(@Payload,'$.price')),CONVERT(FLOAT,JSON_VALUE(@Payload,'$.area')),
 COALESCE(CONVERT(INT,JSON_VALUE(@Payload,'$.bedrooms')),0),COALESCE(CONVERT(INT,JSON_VALUE(@Payload,'$.bathrooms')),0),
 JSON_VALUE(@Payload,'$.furnishing'),JSON_VALUE(@Payload,'$.possession'),JSON_VALUE(@Payload,'$.status'),JSON_VALUE(@Payload,'$.condition'),
 CASE JSON_VALUE(@Payload,'$.featured') WHEN 'true' THEN 1 ELSE 0 END,CASE JSON_VALUE(@Payload,'$.demo') WHEN 'true' THEN 1 ELSE 0 END,
 CASE JSON_VALUE(@Payload,'$.showOnBuy') WHEN 'false' THEN 0 ELSE 1 END,CASE JSON_VALUE(@Payload,'$.showOnSell') WHEN 'false' THEN 0 ELSE 1 END,
 TRY_CONVERT(FLOAT,JSON_VALUE(@Payload,'$.carpetArea')),TRY_CONVERT(FLOAT,JSON_VALUE(@Payload,'$.plotArea')),
 TRY_CONVERT(INT,JSON_VALUE(@Payload,'$.balconies')),TRY_CONVERT(INT,JSON_VALUE(@Payload,'$.parking')),
 JSON_VALUE(@Payload,'$.floor'),JSON_VALUE(@Payload,'$.facing'),JSON_VALUE(@Payload,'$.age'),
 TRY_CONVERT(FLOAT,JSON_VALUE(@Payload,'$.latitude')),TRY_CONVERT(FLOAT,JSON_VALUE(@Payload,'$.longitude')),
 JSON_VALUE(@Payload,'$.videoUrl'),JSON_VALUE(@Payload,'$.documentation'),COALESCE(JSON_QUERY(@Payload,'$.landmarks'),N'[]');
 DELETE FROM drishyam.PropertyImages WHERE propertyId=@Id;
 INSERT drishyam.PropertyImages(propertyId,url,position) SELECT @Id,CONVERT(NVARCHAR(1000),[value]),CONVERT(INT,[key]) FROM OPENJSON(@Payload,'$.images');
 DELETE FROM drishyam.PropertyAmenities WHERE propertyId=@Id;
 INSERT drishyam.PropertyAmenities(propertyId,name) SELECT DISTINCT @Id,CONVERT(NVARCHAR(100),[value]) FROM OPENJSON(@Payload,'$.amenities');
 IF @ActorId IS NOT NULL INSERT drishyam.AuditLogs(userId,action,entityId) VALUES(@ActorId,N'property.saved',@Id);
 COMMIT;
 SELECT @Id AS id;
END;
GO
CREATE OR ALTER PROCEDURE drishyam.usp_Property_Archive @Id NVARCHAR(70),@ActorId UNIQUEIDENTIFIER AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON; BEGIN TRANSACTION;
 UPDATE drishyam.Properties SET status=N'Archived',updatedAt=SYSUTCDATETIME() WHERE id=@Id;
 INSERT drishyam.AuditLogs(userId,action,entityId) VALUES(@ActorId,N'property.archived',@Id);
 COMMIT;
END;
GO
CREATE OR ALTER PROCEDURE drishyam.usp_Settings_Get @Key NVARCHAR(100) AS
BEGIN SET NOCOUNT ON; SELECT value FROM drishyam.SiteSettings WHERE [key]=@Key; END;
GO
CREATE OR ALTER PROCEDURE drishyam.usp_Settings_Save @Key NVARCHAR(100),@Value NVARCHAR(MAX),@ActorId UNIQUEIDENTIFIER=NULL AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON; IF ISJSON(@Value)<>1 THROW 51000,'Invalid settings.',1;
 BEGIN TRANSACTION;
 IF EXISTS(SELECT 1 FROM drishyam.SiteSettings WITH(UPDLOCK,HOLDLOCK) WHERE [key]=@Key)
 UPDATE drishyam.SiteSettings SET value=@Value,updatedAt=SYSUTCDATETIME() WHERE [key]=@Key;
 ELSE INSERT drishyam.SiteSettings([key],value) VALUES(@Key,@Value);
 IF @ActorId IS NOT NULL INSERT drishyam.AuditLogs(userId,action) VALUES(@ActorId,N'settings.updated');
 COMMIT;
END;
GO
CREATE OR ALTER PROCEDURE drishyam.usp_Admin_Find @Email NVARCHAR(200) AS
BEGIN SET NOCOUNT ON; SELECT id,email,name,passwordHash,role,active FROM drishyam.AdminUsers WHERE email=@Email; END;
GO
CREATE OR ALTER PROCEDURE drishyam.usp_Admin_Create @Email NVARCHAR(200),@Name NVARCHAR(100),@PasswordHash NVARCHAR(100) AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 BEGIN TRANSACTION;
 IF EXISTS(SELECT 1 FROM drishyam.AdminUsers WITH(UPDLOCK,HOLDLOCK) WHERE email=@Email) THROW 51001,'This administrator already exists. Credentials were not changed.',1;
 INSERT drishyam.AdminUsers(email,name,passwordHash,role) VALUES(@Email,@Name,@PasswordHash,'ADMIN');
 COMMIT;
END;
GO
CREATE OR ALTER PROCEDURE drishyam.usp_Session_Create @UserId UNIQUEIDENTIFIER,@TokenHash NVARCHAR(64),@ExpiresAt DATETIME2 AS
BEGIN
 SET NOCOUNT ON;
 DELETE FROM drishyam.AdminSessions WHERE expiresAt<SYSUTCDATETIME();
 INSERT drishyam.AdminSessions(userId,tokenHash,expiresAt) VALUES(@UserId,@TokenHash,@ExpiresAt);
END;
GO
CREATE OR ALTER PROCEDURE drishyam.usp_Session_Find @TokenHash NVARCHAR(64) AS
BEGIN
 SET NOCOUNT ON;
 SELECT u.id,u.email,u.name,u.role,u.active FROM drishyam.AdminSessions s INNER JOIN drishyam.AdminUsers u ON s.userId=u.id
 WHERE s.tokenHash=@TokenHash AND s.expiresAt>SYSUTCDATETIME() AND u.active=1;
END;
GO
CREATE OR ALTER PROCEDURE drishyam.usp_Session_Delete @TokenHash NVARCHAR(64) AS
BEGIN SET NOCOUNT ON; DELETE FROM drishyam.AdminSessions WHERE tokenHash=@TokenHash; END;
GO
CREATE OR ALTER PROCEDURE drishyam.usp_RateLimit_Increment @Key NVARCHAR(200),@ResetAt DATETIME2 AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 BEGIN TRANSACTION;
 DELETE FROM drishyam.RateLimits WHERE resetAt<SYSUTCDATETIME();
 IF EXISTS(SELECT 1 FROM drishyam.RateLimits WITH(UPDLOCK,HOLDLOCK) WHERE [key]=@Key)
 UPDATE drishyam.RateLimits SET count=count+1 WHERE [key]=@Key;
 ELSE INSERT drishyam.RateLimits([key],count,resetAt) VALUES(@Key,1,@ResetAt);
 SELECT count FROM drishyam.RateLimits WHERE [key]=@Key;
 COMMIT;
END;
GO
CREATE OR ALTER PROCEDURE drishyam.usp_Enquiry_Create @Payload NVARCHAR(MAX),@IdempotencyKey NVARCHAR(100) AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 DECLARE @Name NVARCHAR(100)=JSON_VALUE(@Payload,'$.name'),@Phone NVARCHAR(30)=JSON_VALUE(@Payload,'$.phone');
 DECLARE @Id UNIQUEIDENTIFIER,@PropertyId NVARCHAR(70)=JSON_VALUE(@Payload,'$.propertyId');
 BEGIN TRANSACTION;
 SELECT @Id=id FROM drishyam.Enquiries WITH(UPDLOCK,HOLDLOCK) WHERE idempotencyKey=@IdempotencyKey;
 IF @Id IS NOT NULL
 BEGIN
  IF EXISTS(SELECT 1 FROM drishyam.Enquiries WHERE id=@Id AND(name<>@Name OR phone<>@Phone)) THROW 51009,'Idempotency conflict.',1;
  SELECT id,name,type,propertyTitle,CAST(0 AS BIT) AS created FROM drishyam.Enquiries WHERE id=@Id;
  COMMIT; RETURN;
 END;
 IF @PropertyId IS NOT NULL AND NOT EXISTS(SELECT 1 FROM drishyam.Properties WHERE id=@PropertyId AND status=N'Available') THROW 51004,'Property unavailable.',1;
 IF JSON_VALUE(@Payload,'$.consent')<>'true' THROW 51000,'Contact consent is required.',1;
 SET @Id=NEWID();
 INSERT drishyam.Enquiries(id,idempotencyKey,name,phone,email,type,category,message,contactTime,consent,propertyId,propertyTitle,propertyCategory,propertyUrl,source,action)
 VALUES(@Id,@IdempotencyKey,@Name,@Phone,JSON_VALUE(@Payload,'$.email'),JSON_VALUE(@Payload,'$.type'),JSON_VALUE(@Payload,'$.category'),
 JSON_VALUE(@Payload,'$.message'),JSON_VALUE(@Payload,'$.contactTime'),1,@PropertyId,JSON_VALUE(@Payload,'$.propertyTitle'),JSON_VALUE(@Payload,'$.propertyCategory'),
 JSON_VALUE(@Payload,'$.propertyUrl'),JSON_VALUE(@Payload,'$.source'),JSON_VALUE(@Payload,'$.action'));
 SELECT id,name,type,propertyTitle,CAST(1 AS BIT) AS created FROM drishyam.Enquiries WHERE id=@Id;
 COMMIT;
END;
GO
CREATE OR ALTER PROCEDURE drishyam.usp_Enquiries_List @Search NVARCHAR(200)=N'',@Status NVARCHAR(30)=N'' AS
BEGIN
 SET NOCOUNT ON;
 SELECT TOP(1000) * FROM drishyam.Enquiries
 WHERE (@Status=N'' OR status=@Status) AND (@Search=N'' OR name LIKE N'%'+@Search+N'%' OR phone LIKE N'%'+@Search+N'%' OR propertyTitle LIKE N'%'+@Search+N'%')
 ORDER BY createdAt DESC;
END;
GO
CREATE OR ALTER PROCEDURE drishyam.usp_Enquiry_Update @Id UNIQUEIDENTIFIER,@Status NVARCHAR(30),@Notes NVARCHAR(MAX),@ActorId UNIQUEIDENTIFIER AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON; BEGIN TRANSACTION;
 UPDATE drishyam.Enquiries SET status=@Status,notes=@Notes,updatedAt=SYSUTCDATETIME() WHERE id=@Id;
 INSERT drishyam.AuditLogs(userId,action,entityId) VALUES(@ActorId,N'enquiry.updated',CONVERT(NVARCHAR(36),@Id)); COMMIT;
END;
GO
CREATE OR ALTER PROCEDURE drishyam.usp_Notification_Claim @Id UNIQUEIDENTIFIER AS
BEGIN
 SET NOCOUNT ON;
 UPDATE drishyam.Enquiries SET notificationStatus=N'Sending' WHERE id=@Id AND notificationStatus=N'Pending';
 SELECT CAST(CASE WHEN @@ROWCOUNT=1 THEN 1 ELSE 0 END AS BIT) AS claimed;
END;
GO
CREATE OR ALTER PROCEDURE drishyam.usp_Notification_Update @Id UNIQUEIDENTIFIER,@Status NVARCHAR(20) AS
BEGIN SET NOCOUNT ON; UPDATE drishyam.Enquiries SET notificationStatus=@Status WHERE id=@Id; END;
GO
CREATE OR ALTER PROCEDURE drishyam.usp_Testimonials_List @ApprovedOnly BIT=1 AS
BEGIN SET NOCOUNT ON; SELECT * FROM drishyam.Testimonials WHERE @ApprovedOnly=0 OR approved=1 ORDER BY createdAt DESC; END;
GO
CREATE OR ALTER PROCEDURE drishyam.usp_Testimonial_Save @Payload NVARCHAR(MAX),@ActorId UNIQUEIDENTIFIER AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 DECLARE @Id UNIQUEIDENTIFIER=COALESCE(TRY_CONVERT(UNIQUEIDENTIFIER,JSON_VALUE(@Payload,'$.id')),NEWID());
 BEGIN TRANSACTION;
 IF EXISTS(SELECT 1 FROM drishyam.Testimonials WITH(UPDLOCK,HOLDLOCK) WHERE id=@Id)
 UPDATE drishyam.Testimonials SET name=JSON_VALUE(@Payload,'$.name'),type=JSON_VALUE(@Payload,'$.type'),quote=JSON_VALUE(@Payload,'$.quote'),
 location=JSON_VALUE(@Payload,'$.location'),rating=TRY_CONVERT(INT,JSON_VALUE(@Payload,'$.rating')),image=JSON_VALUE(@Payload,'$.image'),videoUrl=JSON_VALUE(@Payload,'$.videoUrl'),
 approved=CASE JSON_VALUE(@Payload,'$.approved') WHEN 'true' THEN 1 ELSE 0 END WHERE id=@Id;
 ELSE INSERT drishyam.Testimonials(id,name,type,quote,location,rating,image,videoUrl,approved)
 VALUES(@Id,JSON_VALUE(@Payload,'$.name'),JSON_VALUE(@Payload,'$.type'),JSON_VALUE(@Payload,'$.quote'),JSON_VALUE(@Payload,'$.location'),
 TRY_CONVERT(INT,JSON_VALUE(@Payload,'$.rating')),JSON_VALUE(@Payload,'$.image'),JSON_VALUE(@Payload,'$.videoUrl'),CASE JSON_VALUE(@Payload,'$.approved') WHEN 'true' THEN 1 ELSE 0 END);
 INSERT drishyam.AuditLogs(userId,action,entityId) VALUES(@ActorId,N'testimonial.saved',CONVERT(NVARCHAR(36),@Id));
 COMMIT;
END;
GO
-- Setup remains repeatable; application changes use the same stored-procedure boundary.
