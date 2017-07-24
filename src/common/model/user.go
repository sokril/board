package model

import (
	"time"
)

type User struct {
	ID           int64     `json:"user_id" orm:"column(id)"`
	Username     string    `json:"user_name" orm:"column(username)"`
	Password     string    `json:"user_password" orm:"column(password)"`
	Email        string    `json:"user_email" orm:"column(email)"`
	Realname     string    `json:"user_realname" orm:"column(realname)"`
	Comment      string    `json:"user_comment" orm:"column(comment)"`
	Deleted      int       `json:"user_deleted" orm:"column(deleted)"`
	SystemAdmin  int       `json:"user_system_admin" orm:"column(system_admin)"`
	ProjectAdmin int       `json:"user_project_admin" orm:"column(project_admin)"`
	ResetUUID    string    `json:"user_reset_uuid" orm:"column(reset_uuid)"`
	Salt         string    `json:"user_salt" orm:"column(salt)"`
	CreationTime time.Time `json:"user_creation_time" orm:"column(creation_time)"`
	UpdateTime   time.Time `json:"user_update_time" orm:"column(update_time)"`
}

type ChangePassword struct {
	OldPassword string `json:"user_password_old"`
	NewPassword string `json:"user_password_new"`
}