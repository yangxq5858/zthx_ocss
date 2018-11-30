/*==============================================================*/
/* DBMS name:      MySQL 5.0                                    */
/* Created on:     2018/11/30 8:48:20                           */
/*==============================================================*/


drop table if exists credit_customer;

drop table if exists credit_customer_approve;

drop table if exists credit_customer_freeze;

drop table if exists credit_customer_log;

drop table if exists credit_customer_used;

drop table if exists credit_grail_customer_item;

drop table if exists credit_grail_org;

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
   customer_code        char(36) not null comment '客户代码',
   customer_name        varchar(60) comment '客户名称',
   org_id               char(36) not null comment '组织id',
   org_name             varchar(80) comment '组织名称',
   credit_code          char(10) not null comment '信控范围',
   credit_type          char(10) comment '受信类型',
   credit_limit         numeric(20,2) comment '信贷限额',
   start_time           date comment '有效开始时间',
   end_time             date comment '有效截止时间',
   days                 int comment '有效天数',
   req_reason           varchar(40) comment '申请理由',
   flow_id              char(36) comment '流程id',
   flow_status          varchar(10) comment '流程状态',
   state                int not null default 1 comment '1启用 0停用  默认为1',
   creator_id           char(36) not null comment '创建人ID',
   creator_name         varchar(50) not null comment '创建人姓名',
   created_date         datetime not null comment '创建时间',
   last_editor_id       char(36) not null comment '修改人ID',
   last_editor_name     varchar(50) not null comment '修改人姓名',
   last_edited_date     datetime not null comment '修改时间',
   primary key (id)
);

alter table credit_customer comment '客户信用-申请单';

/*==============================================================*/
/* Table: credit_customer_approve                               */
/*==============================================================*/
create table credit_customer_approve
(
   id                   char(36) not null comment '主键',
   credit_id            char(36) comment '信用id',
   flow_id              char(36) comment '流程id',
   step_code            char(10) comment '步骤编号',
   step_name            varchar(30) comment '步骤名称',
   content              varchar(60) comment '审批内容',
   terminal             varchar(20) comment '操作端',
   flow_status          char(20) comment '流程状态',
   state                int not null default 1 comment '1启用 0停用  默认为1',
   creator_id           char(36) not null comment '创建人ID',
   creator_name         varchar(50) not null comment '创建人姓名',
   created_date         datetime not null comment '创建时间',
   last_editor_id       char(36) not null comment '修改人ID',
   last_editor_name     varchar(50) not null comment '修改人姓名',
   last_edited_date     datetime not null comment '修改时间',
   primary key (id)
);

alter table credit_customer_approve comment '客户信用_审批日志';

/*==============================================================*/
/* Table: credit_customer_freeze                                */
/*==============================================================*/
create table credit_customer_freeze
(
   id                   char(36) not null comment '主键',
   customer_code        char(36) not null comment '客户代码',
   customer_name        varchar(60) comment '客户名称',
   org_id               char(36) not null comment '组织id',
   org_code             char(10) comment '组织代码',
   org_name             varchar(80) comment '组织名称',
   amount_should        numeric(20,2) comment '应付金额',
   amount_freeze        numeric(20,2) comment '冻结金额',
   sync_tiime           date comment '同步时间',
   state                int not null default 1 comment '1启用 0停用  默认为1',
   creator_id           char(36) not null comment '创建人ID',
   creator_name         varchar(50) not null comment '创建人姓名',
   created_date         datetime not null comment '创建时间',
   last_editor_id       char(36) not null comment '修改人ID',
   last_editor_name     varchar(50) not null comment '修改人姓名',
   last_edited_date     datetime not null comment '修改时间',
   primary key (id)
);

alter table credit_customer_freeze comment '客户信用-冻结';

/*==============================================================*/
/* Table: credit_customer_log                                   */
/*==============================================================*/
create table credit_customer_log
(
   id                   char(36) not null,
   credit_id            char(36) comment '信用id',
   oper_type            char(10) comment '操作类型',
   oper_content         varchar(60) comment '操作内容',
   state                int not null default 1 comment '1启用 0停用  默认为1',
   creator_id           char(36) not null comment '创建人ID',
   creator_name         varchar(50) not null comment '创建人姓名',
   created_date         datetime not null comment '创建时间',
   last_editor_id       char(36) not null comment '修改人ID',
   last_editor_name     varchar(50) not null comment '修改人姓名',
   last_edited_date     datetime not null comment '修改时间',
   primary key (id)
);

alter table credit_customer_log comment '客户信用_操作日志';

/*==============================================================*/
/* Table: credit_customer_used                                  */
/*==============================================================*/
create table credit_customer_used
(
   id                   char(36) not null,
   credit_customer_id   char(36) not null comment '信用id',
   customer_code        char(20) comment '客户代码',
   customer_name        varchar(60) comment '客户名称',
   used_type            varchar(20) comment '占用类型',
   credit_type          char(10) comment '信用类型',
   bill_code            varchar(20) not null comment '单据号',
   money                numeric(20,2) comment '金额',
   free_time            date comment '释放时间',
   state                int not null default 1 comment '1启用 0停用  默认为1',
   creator_id           char(36) not null comment '创建人ID',
   creator_name         varchar(50) not null comment '创建人姓名',
   created_date         datetime not null comment '创建时间',
   last_editor_id       char(36) not null comment '修改人ID',
   last_editor_name     varchar(50) not null comment '修改人姓名',
   last_edited_date     datetime not null comment '修改时间',
   primary key (id)
);

alter table credit_customer_used comment '客户信用_占用明细';

/*==============================================================*/
/* Table: credit_grail_customer_item                            */
/*==============================================================*/
create table credit_grail_customer_item
(
   id                   char(36) not null,
   grail_id             char(36) not null comment '大盘id',
   customer_id          char(36) not null comment '客户id',
   customer_name        varchar(80) comment '客户名称',
   credit_limit         numeric(20,2) not null comment '信用额度',
   state                int not null default 1 comment '1启用 0停用  默认为1',
   creator_id           char(36) not null comment '创建人ID',
   creator_name         varchar(50) not null comment '创建人姓名',
   created_date         datetime not null comment '创建时间',
   last_editor_id       char(36) not null comment '修改人ID',
   last_editor_name     varchar(50) not null comment '修改人姓名',
   last_edited_date     datetime not null comment '修改时间',
   primary key (id)
);

alter table credit_grail_customer_item comment '信用_大盘_客户明细';

/*==============================================================*/
/* Table: credit_grail_org                                      */
/*==============================================================*/
create table credit_grail_org
(
   id                   char(36) not null,
   org_id               char(36) comment '组织id',
   org_name             varchar(80) comment '组织名称',
   credit_limit         numeric(20,2) comment '信用额度',
   state                int not null default 1 comment '1启用 0停用  默认为1',
   creator_id           char(36) not null comment '创建人ID',
   creator_name         varchar(50) not null comment '创建人姓名',
   created_date         datetime not null comment '创建时间',
   last_editor_id       char(36) not null comment '修改人ID',
   last_editor_name     varchar(50) not null comment '修改人姓名',
   last_edited_date     datetime not null comment '修改时间',
   primary key (id)
);

alter table credit_grail_org comment '信用_大盘';

/*==============================================================*/
/* Table: credit_grail_org_item                                 */
/*==============================================================*/
create table credit_grail_org_item
(
   id                   char(36) not null,
   grail_id             char(36) not null comment '大盘id',
   org_id               char(36) not null comment '组织id',
   org_name             varchar(80) comment '组织名称',
   credit_limit         numeric(20,2) not null comment '信用额度',
   state                int not null default 1 comment '1启用 0停用  默认为1',
   creator_id           char(36) not null comment '创建人ID',
   creator_name         varchar(50) not null comment '创建人姓名',
   created_date         datetime not null comment '创建时间',
   last_editor_id       char(36) not null comment '修改人ID',
   last_editor_name     varchar(50) not null comment '修改人姓名',
   last_edited_date     datetime not null comment '修改时间',
   primary key (id)
);

alter table credit_grail_org_item comment '信用_大盘_组织明细';

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

alter table credit_level comment '信控等级';

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

alter table credit_range comment '信控范围';

/*==============================================================*/
/* Table: credit_role                                           */
/*==============================================================*/
create table credit_role
(
   id                   char(36) not null,
   role                 char(36) not null comment '规则',
   state                int not null default 1 comment '1启用 0停用  默认为1',
   creator_id           char(36) not null comment '创建人ID',
   creator_name         varchar(50) not null comment '创建人姓名',
   created_date         datetime not null comment '创建时间',
   last_editor_id       char(36) not null comment '修改人ID',
   last_editor_name     varchar(50) not null comment '修改人姓名',
   last_edited_date     datetime not null comment '修改时间',
   primary key (id)
);

alter table credit_role comment '信用额度规则';

