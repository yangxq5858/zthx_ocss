/*==============================================================*/
/* DBMS name:      MySQL 5.0                                    */
/* Created on:     2018/11/28 13:44:50                          */
/*==============================================================*/


drop table if exists credit_customer;

drop table if exists credit_customer_approve;

drop table if exists credit_customer_freeze;

drop table if exists credit_customer_log;

drop table if exists credit_customer_used;

drop table if exists credit_grail;

drop table if exists credit_grail_customer_item;

drop table if exists credit_grail_org_item;

drop table if exists credit_level;

drop table if exists credit_range;

drop table if exists credit_role;

/*==============================================================*/
/* Table: credit_customer                                       */
/*==============================================================*/
create table credit_customer
(
   id                   char(36) not null,
   customer_code        char(36) not null,
   customer_name        varchar(60),
   org_id               char(36) not null,
   org_name             varchar(80),
   credit_code          char(10) not null,
   credit_type          char(10),
   credit_limit         numeric(20,2),
   start_time           date,
   end_time             date,
   days                 int,
   req_reason           varchar(40),
   flow_id              char(36),
   flow_status          varchar(10),
   state                int not null default 1 comment '1启用 0停用  默认为1',
   creator_id           char(36) not null comment '创建人ID',
   creator_name         varchar(50) not null comment '创建人姓名',
   created_date         datetime not null comment '创建时间',
   last_editor_id       char(36) not null comment '修改人ID',
   last_editor_name     varchar(50) not null comment '修改人姓名',
   last_edited_date     datetime not null comment '修改时间',
   primary key (id)
);

/*==============================================================*/
/* Table: credit_customer_approve                               */
/*==============================================================*/
create table credit_customer_approve
(
   id                   char(36) not null,
   credit_id            char(36),
   flow_id              char(36),
   step_code            char(10),
   step_name            varchar(30),
   content              varchar(60),
   terminal             varchar(20),
   flow_status          char(20),
   state                int not null default 1 comment '1启用 0停用  默认为1',
   creator_id           char(36) not null comment '创建人ID',
   creator_name         varchar(50) not null comment '创建人姓名',
   created_date         datetime not null comment '创建时间',
   last_editor_id       char(36) not null comment '修改人ID',
   last_editor_name     varchar(50) not null comment '修改人姓名',
   last_edited_date     datetime not null comment '修改时间',
   primary key (id)
);

/*==============================================================*/
/* Table: credit_customer_freeze                                */
/*==============================================================*/
create table credit_customer_freeze
(
   id                   char(36) not null,
   customer_code        char(36) not null,
   customer_name        varchar(60),
   org_id               char(36) not null,
   org_code             char(10),
   org_name             varchar(80),
   amount_should        numeric(20,2),
   amount_freeze        numeric(20,2),
   sync_tiime           date,
   state                int not null default 1 comment '1启用 0停用  默认为1',
   creator_id           char(36) not null comment '创建人ID',
   creator_name         varchar(50) not null comment '创建人姓名',
   created_date         datetime not null comment '创建时间',
   last_editor_id       char(36) not null comment '修改人ID',
   last_editor_name     varchar(50) not null comment '修改人姓名',
   last_edited_date     datetime not null comment '修改时间',
   primary key (id)
);

/*==============================================================*/
/* Table: credit_customer_log                                   */
/*==============================================================*/
create table credit_customer_log
(
   id                   char(36) not null,
   credit_id            char(36),
   oper_type            char(10),
   oper_content         varchar(60),
   state                int not null default 1 comment '1启用 0停用  默认为1',
   creator_id           char(36) not null comment '创建人ID',
   creator_name         varchar(50) not null comment '创建人姓名',
   created_date         datetime not null comment '创建时间',
   last_editor_id       char(36) not null comment '修改人ID',
   last_editor_name     varchar(50) not null comment '修改人姓名',
   last_edited_date     datetime not null comment '修改时间',
   primary key (id)
);

/*==============================================================*/
/* Table: credit_customer_used                                  */
/*==============================================================*/
create table credit_customer_used
(
   id                   char(36) not null,
   credit_customer_id   char(36) not null,
   customer_id          char(36) not null,
   customer_code        char(20),
   customer_name        varchar(60),
   used_type            varchar(20),
   credit_type          char(10),
   bill_code            varchar(20) not null,
   money                numeric(20,2),
   free_time            date,
   state                int not null default 1 comment '1启用 0停用  默认为1',
   creator_id           char(36) not null comment '创建人ID',
   creator_name         varchar(50) not null comment '创建人姓名',
   created_date         datetime not null comment '创建时间',
   last_editor_id       char(36) not null comment '修改人ID',
   last_editor_name     varchar(50) not null comment '修改人姓名',
   last_edited_date     datetime not null comment '修改时间',
   primary key (id)
);

/*==============================================================*/
/* Table: credit_grail                                          */
/*==============================================================*/
create table credit_grail
(
   id                   char(36) not null,
   org_id               char(36),
   org_name             varchar(80),
   credit_limit         numeric(20,2),
   state                int not null default 1 comment '1启用 0停用  默认为1',
   creator_id           char(36) not null comment '创建人ID',
   creator_name         varchar(50) not null comment '创建人姓名',
   created_date         datetime not null comment '创建时间',
   last_editor_id       char(36) not null comment '修改人ID',
   last_editor_name     varchar(50) not null comment '修改人姓名',
   last_edited_date     datetime not null comment '修改时间',
   primary key (id)
);

/*==============================================================*/
/* Table: credit_grail_customer_item                            */
/*==============================================================*/
create table credit_grail_customer_item
(
   id                   char(36) not null,
   grail_id             char(36) not null,
   customer_id          char(36) not null,
   customer_name        varchar(80),
   credit_limit         numeric(20,2) not null,
   state                int not null default 1 comment '1启用 0停用  默认为1',
   creator_id           char(36) not null comment '创建人ID',
   creator_name         varchar(50) not null comment '创建人姓名',
   created_date         datetime not null comment '创建时间',
   last_editor_id       char(36) not null comment '修改人ID',
   last_editor_name     varchar(50) not null comment '修改人姓名',
   last_edited_date     datetime not null comment '修改时间',
   primary key (id)
);

/*==============================================================*/
/* Table: credit_grail_org_item                                 */
/*==============================================================*/
create table credit_grail_org_item
(
   id                   char(36) not null,
   grail_id             char(36) not null,
   org_id               char(36) not null,
   org_name             varchar(80),
   credit_limit         numeric(20,2) not null,
   state                int not null default 1 comment '1启用 0停用  默认为1',
   creator_id           char(36) not null comment '创建人ID',
   creator_name         varchar(50) not null comment '创建人姓名',
   created_date         datetime not null comment '创建时间',
   last_editor_id       char(36) not null comment '修改人ID',
   last_editor_name     varchar(50) not null comment '修改人姓名',
   last_edited_date     datetime not null comment '修改时间',
   primary key (id)
);

/*==============================================================*/
/* Table: credit_level                                          */
/*==============================================================*/
create table credit_level
(
   id                   char(36) not null,
   level                char(10) comment '等级',
   score                varchar(20) comment '评分范围',
   limit_top            numeric(20,2) comment '最高授信额度',
   "desc"               varchar(60) comment '描述',
   state                int not null default 1 comment '1启用 0停用  默认为1',
   creator_id           char(36) not null comment '创建人ID',
   creator_name         varchar(50) not null comment '创建人姓名',
   created_date         datetime not null comment '创建时间',
   last_editor_id       char(36) not null comment '修改人ID',
   last_editor_name     varchar(50) not null comment '修改人姓名',
   last_edited_date     datetime not null comment '修改时间',
   primary key (id)
);

/*==============================================================*/
/* Table: credit_range                                          */
/*==============================================================*/
create table credit_range
(
   id                   char(36) not null,
   org_id               char(36) not null comment '组织结构',
   sale_channel_code    char(10) not null comment '分销渠道',
   product_group_code   char(10) not null comment '产品组',
   credit_code          char(10) not null comment '信控范围',
   state                int not null default 1 comment '1启用 0停用  默认为1',
   creator_id           char(36) not null comment '创建人ID',
   creator_name         varchar(50) not null comment '创建人姓名',
   created_date         datetime not null comment '创建时间',
   last_editor_id       char(36) not null comment '修改人ID',
   last_editor_name     varchar(50) not null comment '修改人姓名',
   last_edited_date     datetime not null comment '修改时间',
   primary key (id)
);

/*==============================================================*/
/* Table: credit_role                                           */
/*==============================================================*/
create table credit_role
(
   id                   char(36) not null,
   role                 char(36) not null,
   state                int not null default 1 comment '1启用 0停用  默认为1',
   creator_id           char(36) not null comment '创建人ID',
   creator_name         varchar(50) not null comment '创建人姓名',
   created_date         datetime not null comment '创建时间',
   last_editor_id       char(36) not null comment '修改人ID',
   last_editor_name     varchar(50) not null comment '修改人姓名',
   last_edited_date     datetime not null comment '修改时间',
   primary key (id)
);

