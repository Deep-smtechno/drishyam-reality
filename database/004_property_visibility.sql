-- Lets an administrator switch a listing on (Available) or off (Inactive) from the properties table. The change is recorded in the audit log.
CREATE OR ALTER PROCEDURE drishyam.usp_Property_SetActive @Id NVARCHAR(70),@Active BIT,@ActorId UNIQUEIDENTIFIER=NULL AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 BEGIN TRANSACTION;
 UPDATE drishyam.Properties SET status=CASE WHEN @Active=1 THEN N'Available' ELSE N'Inactive' END,updatedAt=SYSUTCDATETIME() WHERE id=@Id;
 IF @@ROWCOUNT>0 AND @ActorId IS NOT NULL
  INSERT drishyam.AuditLogs(userId,action,entityId) VALUES(@ActorId,CASE WHEN @Active=1 THEN N'property.activated' ELSE N'property.deactivated' END,@Id);
 COMMIT;
END;
GO
