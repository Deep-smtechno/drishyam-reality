-- Lets an administrator permanently delete an enquiry. The deletion is recorded in the audit log.
CREATE OR ALTER PROCEDURE drishyam.usp_Enquiry_Delete @Id UNIQUEIDENTIFIER,@ActorId UNIQUEIDENTIFIER=NULL AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 BEGIN TRANSACTION;
 DELETE FROM drishyam.Enquiries WHERE id=@Id;
 IF @@ROWCOUNT>0 AND @ActorId IS NOT NULL
  INSERT drishyam.AuditLogs(userId,action,entityId) VALUES(@ActorId,N'enquiry.deleted',CONVERT(NVARCHAR(36),@Id));
 COMMIT;
END;
GO
