<div class="imageContainer" style="" >
    <img src="../img/stategraems_logo.png" title="STATegra EMS LOGO."/>
</div>

#System requirements

STATegra EMS was developed to run under a UNIX SYSTEM. In spite of the software in which depends on can also work under other environments (e.g. Windows OS), it is not guaranteed that STATegra EMS does.
In order to install STATegra EMS, you must first install the software dependencies. The required steps are outlined in the following subsections, which were followed to successfully install STATegra EMS on a Debian machine (Debian 7.1).

<div class="imageContainer" style="box-shadow: 0px 0px 20px #D0D0D0; text-align:center; font-size:10px; color:#898989" >
    <img src="../img/4_installation_1.jpg" title="System requirements."/>
</div>

## JDK

STATegra EMS run under Apache Tomcat (v7.0 or greater) which depend on Java.
Compatible JDKs for many platforms (or links to where they can be found) are available at [http://www.oracle.com/technetwork/java/javase/downloads/index.html](http://www.oracle.com/technetwork/java/javase/downloads/index.html).

As example, these are the steps followed to install in the Debian machine.

**1.DOWNLOAD JDK** FROM http://www.oracle.com/technetwork/java/javase/downloads/jdk7-downloads-1880260.html

**2.Uncompress the jdk files** in the directory /opt/ and create a soft link
  
```bash
      $ sudo tar xzvf jdk-7u25-linux-i586.tar.gz -C /opt/     
      $ sudo ln -s /opt/jdk1.7.0_25 /opt/jdk
```
   
**3.Create soft links for the java binaries** in /usr/local/bin

```bash
$ sudo ln -s /opt/jdk/bin/java /usr/bin/
$ sudo ln -s /opt/jdk/bin/javaw /usr/bin/
```

**4. Check if java is correctly installed.**

```bash
$ java -version
```
## Apache Tomcat (v7.0 or greater)
Binary downloads of the Apache Tomcat server are available from [http://tomcat.apache.org/download-70.cgi](http://tomcat.apache.org/download-70.cgi).

You can find thousand of manuals for Tomcat installation in internet so we will not explain it deeper but, briefly, the following steps were performed.

**1.Get Apache Tomcat 7***

```bash
$ wget http://apache.rediris.es/tomcat/tomcat-7/v7.0.57/bin/apache-tomcat-7.0.57.tar.gz
$ sudo tar xzvf apache-tomcat-7.0.57.tar.gz -C /opt/
$ sudo ln -s /opt/apache-tomcat-7.0.57/ /opt/tomcat/
```

2.Create the tomcat group and user.

```bash
$ groupadd tomcat
$ useradd -g tomcat -d /opt/tomcat tomcat
$ usermod -G www-data tomcat
Add Tomcat as a service (managed by init.d).
$ nano /etc/init.d/tomcat

# Add the following code to file:

#Tomcat auto-start
#description: Auto-starts tomcat
#processname: tomcat
#pidfile: /var/run/tomcat.pid
#this path should point to your JAVA_HOME Directory
export JAVA_HOME=/opt/jdk
case $1 in
start)
sh /opt/tomcat/bin/startup.sh
;; 
stop)
sh /opt/tomcat/bin/shutdown.sh
;; 
restart)
sh /opt/tomcat/bin/shutdown.sh
sh /opt/tomcat/bin/startup.sh
;;
esac
exit 0


$ chmod 755 /etc/init.d/tomcat
$ /etc/init.d/tomcat start
```

3.Enable Tomcat auto-start on boot

```bash
$ update-rc.d tomcat defaults
```

4.Modify Tomcat users file.
Set the user and password for Tomcat Manager Interface adding the following lines (setting the username and the password to your own administration user and password).

```bash
$ nano /usr/local/tomcat/conf/tomcat-users.xml

<tomcat-users>
[...]
<role rolename="tomcat"/> 
<role rolename="manager-gui"/> 
<user username="admin" password="adminpassword" roles="tomcat,manager-gui"/> 
[...]
</tomcat-users>
```

Now we can access to the Tomcat Manager Interface via http://localhost:8080/ or using the current IP address and the port 8080 (e.g. 172.24.76.218:8080).

<p style="  font-size: 10px;">* STATegra EMS was developed and tested under Apache Tomcat Version 7, so it is not guaranteed to work on other Tomcat versions.</p>

## MySQL 5
STATegra EMS use MySQL 5 relational database management system for data storage.
Binaries can be downloaded from [http://dev.mysql.com/downloads/mysql/](http://dev.mysql.com/downloads/mysql/).

Again, we will not explain the MySQL installation since it is not the objective of this manual.

