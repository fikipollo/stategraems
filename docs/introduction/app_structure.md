<div class="imageContainer" style="" >
    <img src="../img/stategraems_logo.png" title="STATegra EMS LOGO."/>
</div>

# STATegra EMS: Application architecture
The STATegra EMS was designed as a multiuser web application and is divided in two components: the SERVER SIDE application and the CLIENT SIDE web application (Figure 1).

<div class="imageContainer" style="text-align:center; font-size:10px; color:#898989" >
    <img src="../img/3_app-structure_1.jpg" title="Figure 1. Overview of the STATegra EMS architecture."/>
    <p class="imageLegend">Figure 1. Overview of the STATegra EMS architecture.</p>
</div>

The server side is the responsible for keeping the consistency of data and for controlling the access to the stored information, is built using Java Servlets and a MySQL relational database and is unique for all clients. Although primarily designed and tested on Linux servers, the server EMS code could easily be adapted to work over other architectures due to the cross-platform nature of Java. Additionally, the server code was implemented using the Data Access Object design pattern in conjunction with the Data Transfer Object pattern. This provides an abstraction layer for interaction with databases that acts as an intermediary between server application (servlets) and the MySQL database, making easier future extensions of the application code with new features or changes in the database model.

The STATegra EMS client side was developed as user-friendly and intuitive web application using Ext JS, a cross-browser JavaScript framework which provided powerful tools for building interactive web applications. The client side is based on the Model-View-Controller architecture pattern, which make easier to organize, maintain and extend large client applications. Communication between Client and Server side is handled by AJAX and HTTP GET and POST protocols using JavaScript Object Notation (JSON) for data exchange.
