USE user_conch;
GO
create table users
(
	id int IDENTITY(1,1) primary key, --�۰ʻ��W���ߤ@�ѧO�X
	username nvarchar(50) not null unique,--�b���]�����ߤ@�^
	email nvarchar(128) not null unique,--�q�l�l��]�����ߤ@�^
	password nvarchar(255) not null,--�[�K���K�X
	created_at datetime default getdate()--���U�ɶ��]�w�]����e�ɶ��^
)

delete from users


