#!/bin/bash

#ssh <SSH_USER>@<SSH_HOST> "find <PATH TO PROJECT DATA DIRECTORY>" > <PATH TO STATEGRA EMS APP DATA DIRECTORY>/<EXPERIMENT ID>/experimentDataDirectoryContent.txt
ssh rhernan@mycluster "find /stategra_project/data/" > /data/stategraems_app_data/EXP00001/experimentDataDirectoryContent.txt
