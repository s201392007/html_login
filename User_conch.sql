USE user_conch;
GO
create table users
(
	id int IDENTITY(1,1) primary key, --自動遞增的唯一識別碼
	username nvarchar(50) not null unique,--帳號（必須唯一）
	email nvarchar(128) not null unique,--電子郵件（必須唯一）
	password nvarchar(255) not null,--加密的密碼
	created_at datetime default getdate()--註冊時間（預設為當前時間）
)

delete from users


