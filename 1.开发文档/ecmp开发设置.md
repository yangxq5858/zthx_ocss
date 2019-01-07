# 1.后台应用热加载

应用程序的启动配置

1) Shorten command line: 选 classpath file

2)Running Application Update Policies下选择

  Update classes and resources

3)应用程序启动，要以debug模式运行

4)改写后台代码后，要重新编译

5)重新编译后，可以看到提示栏，有xx个class文件被Loaded 表示热加载成功。

# 2.公用Jar包的Gradle设置

## build.gradle 文件：

```gradle
buildscript {
    ext {
        springBootVersion = springBootVersion
    }
    repositories {
        mavenLocal()

        maven { url REPOSITORY }

        mavenCentral()
    }
    dependencies {
        classpath("org.springframework.boot:spring-boot-gradle-plugin:${springBootVersion}")
    }
}

apply plugin: 'java'
apply plugin: 'eclipse'
apply plugin: 'maven' // 引入maven插件
apply plugin: 'org.springframework.boot'
apply plugin: 'io.spring.dependency-management'
//apply plugin: 'war'

group = GROUP
version = VERSION
sourceCompatibility = COMPATIBILITY

repositories {
    mavenLocal()

    maven { url REPOSITORY }
         
    mavenCentral()
}


dependencies {
    //ecmp自动配置
    compile("com.ecmp:ecmp-spring-boot-autoconfigure:${ecmp_version}")
    compile('org.springframework.boot:spring-boot-starter-web')
    compile('com.alibaba:druid-spring-boot-starter:1.1.9')
    compile('com.fasterxml.jackson.dataformat:jackson-dataformat-xml')
    compile("com.ecmp:jpa-ecmp-spring-boot-starter:${ecmp_version}")
    compile("com.ecmp:service-ecmp-spring-boot-starter:${ecmp_version}")
    compile("com.ecmp:edm-ecmp-spring-boot-starter:${ecmp_version}")
    compile("com.ecmp:flow-service-client:$flow_version")
    compile("com.alibaba:fastjson:1.2.15")
    compile("io.springfox:springfox-swagger2:2.9.2",
            "io.springfox:springfox-swagger-ui:2.9.2")
    runtime('mysql:mysql-connector-java')
    compile group: 'org.apache.poi', name: 'poi', version: '3.9'
    compile group: 'org.apache.poi', name: 'poi-ooxml', version: '3.9'
    //用jersey 提供cxf流程回调接口
    compile('org.springframework.boot:spring-boot-starter-jersey')
    compile('org.apache.cxf:cxf-spring-boot-starter-jaxrs:3.2.1')
    compile('org.apache.cxf:cxf-rt-frontend-jaxws:3.1.6')
    // 测试
    testCompile('org.springframework.boot:spring-boot-starter-test')
}

//war {
//    enabled = true
//    //包名称
//    archiveName "${baseName}.${extension}"
//    //包存放路径
//    destinationDir = file("${rootProject.projectDir}/build/war")
//}

jar {
    manifest {
        attributes("Manifest-Version": "1.0")
        attributes("Created-By": "Gradle")
        attributes("Implementation-Title": "ECMP-$project.name")
        attributes("Implementation-Version": "$project.version")
        attributes("Build-Time": new Date().format("yyyy-MM-dd HH:mm:ss"))
    }
    enabled = true
}

/////////////////////////////////////上传Maven仓库////////////////////////////////////////
//打包源代码
task sourcesJar(type: Jar, dependsOn: classes) {
    classifier = 'sources'
    from sourceSets.main.allSource
}

artifacts {
    archives sourcesJar
}

//如果希望gradle install，安装到.m2本地仓库，参考下面的内容
install {
    repositories.mavenInstaller {
        pom.version = "$project.version"
        pom.artifactId = "$project.name"
        pom.groupId = "$project.group"
    }
}



//上传到nexus
uploadArchives {
    repositories {
        mavenDeployer {
            repository(url: MAVEN_REPO_URL) {
                authentication(userName: NEXUS_USERNAME, password: NEXUS_PASSWORD)
            }
            pom.version = "$project.version"
            pom.artifactId = "$project.name"
            pom.groupId = "$project.group"
        }
    }
    return 'Success'
}


```

## gradle.properties文件：

```properties
# 组织
GROUP = com.ecmp.zt.ocss
# 版本
VERSION = 3.0.28
# JAVA版本号要求
COMPATIBILITY=1.8
//仓库地址
REPOSITORY=http://rddgit.changhong.com:8081/nexus/content/groups/ZT_Group/
# ####################### 依赖ECMP平台组件版本 ############################
util_version=1.+
ecmp_version=3.+
flow_version = 3.+

basic_version=3.+
security_version=1.+
# ####################### 依赖第三方组件版本 ##############################
springBootVersion=2.0.5.RELEASE
flyway_version = 4.1.2
mysql_version = 5.1.41
oracle_version=12.2.0.1
nutz_version=1.r.66

# ####################### Maven Nexus ##############################
#Maven仓库地址
MAVEN_REPO_URL=http://rddgit.changhong.com:8081/nexus/content/repositories/ZT-Dev

#账号
NEXUS_USERNAME=zt_dev
#密码
NEXUS_PASSWORD=123456

# ####################### flyway ##############################
#flyway_driver=oracle.jdbc.OracleDriver
#flyway_url=jdbc:oracle:thin:@10.4.68.46:1521:oracle46
#flyway_user=dba
#flyway_password=123456

```

## 打包步骤

先执行build下的clean，再执行jar，最后，执行upload下的uploadArchives

如果要安装到本地maven仓库，需要执行other下的install

# 3.公共jar包库强制更新

1）gradle中的build下的classes，点右键运行一下，就会生成一个ocss-credit[classes]的启动项。

2）edit configurations，这个ocss-credit[classes]

3)  在 arguments 中输入 -xtest --refresh-dependencies

4）在gradle中的build下的classes，点右键，选择Run。注意，一定是右键运行，双击运行不行。

控制台会输出：Executing task 'classes -xtest --refresh-dependencies'...

5）运行完毕后，点击gradle的刷新按钮，这时，就会强制更新了。













