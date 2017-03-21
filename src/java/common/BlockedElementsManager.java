/* ***************************************************************
 *  This file is part of STATegra EMS.
 *
 *  STATegra EMS is free software: you can redistribute it and/or 
 *  modify it under the terms of the GNU General Public License as
 *  published by the Free Software Foundation, either version 3 of 
 *  the License, or (at your option) any later version.
 * 
 *  STATegra EMS is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 * 
 *  You should have received a copy of the GNU General Public License
 *  along with STATegra EMS.  If not, see <http://www.gnu.org/licenses/>.
 * 
 *  More info http://bioinfo.cipf.es/stategraems
 *  Technical contact stategraemsdev@gmail.com
 *  *************************************************************** */
package common;

import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
//import javax.swing.JOptionPane;
import javax.swing.Timer;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class BlockedElementsManager {

    private static BlockedElementsManager INSTANCE = null;
    //The blocked time in MINUTES
    //TODO: SET TO 30 MIN
    private final int BLOCKED_TIME = 30;
    //QUEUE OF LOCKED ELEMENTS
    private ArrayList<LockedElement> lockedObjects;
    private HashMap<String, String> lockedIDs;
    private Timer timer;

    private BlockedElementsManager() {
        lockedObjects = new ArrayList<LockedElement>();
        lockedIDs = new HashMap<String, String>();
    }

    // creador sincronizado para protegerse de posibles problemas  multi-hilo
    // otra prueba para evitar instanciación múltiple 
    private synchronized static void initializesBlockedElementsManager() {
        if (INSTANCE == null) {
            // Sólo se accede a la zona sincronizada
            // cuando la instancia no está creada
            synchronized (BlockedElementsManager.class) {
                // En la zona sincronizada sería necesario volver
                // a comprobar que no se ha creado la instancia
                if (INSTANCE == null) {
                    INSTANCE = new BlockedElementsManager();
                }
            }
        }
    }

    public static BlockedElementsManager getBlockedElementsManager() {
        if (INSTANCE == null) {
            initializesBlockedElementsManager();
        }
        return INSTANCE;
    }

    /**
     * This function removes the current timer
     */
    private synchronized void cleanTimer() {
        if (INSTANCE.timer != null && timer.isRunning()) {
            INSTANCE.timer.removeActionListener(timer.getActionListeners()[0]);
            INSTANCE.timer.stop();
            INSTANCE.timer = null;
        }
    }

    /**
     * This function creates a new timer for the first element in the queue
     */
    private synchronized void startTimer() {
        if (INSTANCE.timer == null && !INSTANCE.lockedObjects.isEmpty()) {
            final LockedElement nextTask = INSTANCE.lockedObjects.get(0);

            if (nextTask != null) {
                long time = nextTask.getDate().getTime() - new Date().getTime();

                INSTANCE.timer = new Timer((int) time, new ActionListener() {
                    @Override
                    public void actionPerformed(ActionEvent e) {
                        //REMOVE THE ELEMENT FROM THE QUEUE
                        unlockObject(nextTask.getElementID(), null);
                    }
                });
                INSTANCE.timer.start();
            }
        }
    }

    /**
     * This function add a new pair (element_id, date) to the list of blocked
     * elements.
     *
     * @param element_id
     * @return
     */
    public synchronized boolean lockObject(String element_id, String userID) {
        LockedElement newPair = new LockedElement(element_id, userID);
        int pos = INSTANCE.lockedObjects.indexOf(newPair);
        if (pos != -1) {
            if (INSTANCE.lockedObjects.get(pos).getUserID().equalsIgnoreCase(userID)) {
                unlockObject(element_id, userID);
                return lockObject(element_id, userID);
            }
            return false;
        }
        newPair.setDate(new Date(new Date().getTime() + ((BLOCKED_TIME + 2) * 60 * 1000)));
        INSTANCE.lockedObjects.add(newPair);
        INSTANCE.startTimer();
        return true;
    }

    /**
     * This function unlock a blocked element, checking first if the element is
     * contained in the blocked elements list. After that, refresh the timer.
     * This function can be accessed directly due to an user request (ie. when
     * the user presses the "Save" button finishing the editing process) or can
     * be accessed as consequence of ane expired Timer.
     *
     * @param element_id
     * @return
     */
    public synchronized boolean unlockObject(String element_id, String userID) {
        synchronized (BlockedElementsManager.class) {
            userID = (userID==null)?"":userID;
            
            LockedElement newPair = new LockedElement(element_id, userID);
            int pos = INSTANCE.lockedObjects.indexOf(newPair);
            if (pos == -1) {
                return false;
            }
            //IF OBEJCT IN THE QUEUE
            INSTANCE.lockedObjects.remove(pos);
            //IF OBEJCT WAS THE FIRST ELEMENT IN THE QUEUE
            if (pos == 0) {
                //CLEAN THE TIMER
                cleanTimer();
                //ADD TIMER FOR THE NEXT TAKS, IF ANY
                startTimer();
            }
            return true;
        }
    }

    public synchronized boolean unlockAllObjects(String userID) {
        synchronized (BlockedElementsManager.class) {
            int lastPos = -1;
            for (int i = INSTANCE.lockedObjects.size() - 1; i >= 0; i--) {
                if (INSTANCE.lockedObjects.get(i).getUserID().equalsIgnoreCase(userID)) {
                    lastPos = i;
                    INSTANCE.lockedObjects.remove(i);
                }
            }
            //IF THE FIRST ELEMENT WAS REMOVED (THE ELEMENT ASSOCIATED TO THE CURRENT TIMER)
            if (lastPos == 0) {
                //CLEAN THE TIMER
                cleanTimer();
                //ADD TIMER FOR THE NEXT TAKS, IF ANY
                startTimer();
            }
            return true;
        }
    }

    /**
     * This function add a new pair (element_id, date) to the list of blocked
     * elements.
     *
     * @param elementID
     * @return
     */
    public synchronized boolean lockID(String elementID) {
        //TODO: DO SYNCHRONIZED
        if (INSTANCE.lockedIDs.containsKey(elementID)) {
            return false;
        }
        INSTANCE.lockedIDs.put(elementID, elementID);
        return true;
    }

    /**
     * This function add a new pair (element_id, date) to the list of blocked
     * elements.
     *
     * @param elementID
     * @return
     */
    public synchronized boolean unlockID(String elementID) {
        if (INSTANCE.lockedIDs.containsKey(elementID)) {
            INSTANCE.lockedIDs.remove(elementID);
            return true;
        }
        return false;
    }
    
    public String getLockerID(String element_id) {
            LockedElement newPair = new LockedElement(element_id, "");
            int pos = INSTANCE.lockedObjects.indexOf(newPair);
            if (pos != -1) {
                return INSTANCE.lockedObjects.get(pos).getUserID();
            }
            return null;
    }

    public static String getErrorMessage() {
        //TODO
        return "The object can not be edited because...";
    }

    private class LockedElement {

        String elementID;
        String userID;
        Date date;

        public LockedElement(String elementID, String userID) {
            this.elementID = elementID;
            this.userID = userID;
            this.date = new Date();
        }

        @Override
        public int hashCode() {
            int hash = 7;
            return hash;
        }

        @Override
        public boolean equals(Object obj) {
            if (obj == null) {
                return false;
            }
            if (getClass() != obj.getClass()) {
                return false;
            }
            final LockedElement other = (LockedElement) obj;
            if ((this.elementID == null) ? (other.elementID != null) : !this.elementID.equals(other.elementID)) {
                return false;
            }

            return true;
        }

        public String getElementID() {
            return elementID;
        }

        public void setElementID(String elementID) {
            this.elementID = elementID;
        }

        public String getUserID() {
            return userID;
        }

        public void setUserID(String userID) {
            this.userID = userID;
        }

        public Date getDate() {
            return date;
        }

        public void setDate(Date date) {
            this.date = date;
        }
    }
}
