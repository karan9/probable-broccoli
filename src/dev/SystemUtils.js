import { execFile } from 'child_process'; 
import path from 'path';
import os from 'os';

import * as win from 'node-windows';


class SystemUtils {

  constructor() {

    this.systemDisableProc = null;
    this.isSystemBlockerEnabled = false;

    this.SOFTWARE_KILL_LIST = [
      /* task manager */
      'taskmgr.exe',
      
      /* Team Viewer */
      'TeamViewer.exe',

      /* Log Me In */
      'LMIRTechConsole.exe',
      'LogMeInSystray.exe',
      'LogMeInToolkit.exe',
      'LMIIgnition.exe',
      'LMI_Rescue.exe',

      /* weird name supremo */
      "sp\ [3].exe",

      /* more show my pc */
      'SMPCSetup.exe',

      /* Aero Admin */
      'AeroAdmin.exe',

      /* Ammy Admin */
      'AA_v3.exe',

      /* Go To Assist */
      'g2mcomm.exe',
      'g2mlauncher.exe',
      'g2mstart.exe',
      'g2mui.exe',
      'g2ax_user_customer.exe',
      // 'g2ax_host_service.exe',
      // 'g2ax_comm_expert.exe',
      // 'g2ax_session_expert.exe',
      'GoTo\ Opener.exe',
      'g2ax_start.exe',
      'g2ax_user_expert.exe',
      'g2mvideoconference.exe',
      
      /* remote desktop software */
      'RPCPrintServer.exe',
      'RPCSuite.exe',

      /* Supremo Control OKISH version */
      'Supremo.exe',

      /* join.me */
      'join.me.exe',
      'join.me.installer.exe',

      /* AnyDesk */
      'AnyDesk.exe',
    ];
  }

  /**
   * enables the Software Killer
   */
  enableSoftwareKill() {
    console.log("Enabling Software Killer");
  }

  /**
   * 
   * disables the Software Killer
   */
  disableSoftwareKill() {
    console.log("Disabling Software Killer");
  }

  /**
   * 
   * enables the System Blocker
   */
  enableSystemBlocker() {
    let filePath = path.normalize(`C:\\Users\\${os.userInfo().username}\\AppData\\Roaming\\websecure\\WpfApp1.exe`);
    let blockExeName = "WpfApp1.exe";
    
    console.log("System Blocker Called");
    console.log("FIle Path is " + filePath);

    if (this.systemDisableProc) {
      console.log("System blocker already Running");  
      
      /**
       * check if software is really running
       */
      win.list((list) => {
        for(let i=0; i<list.length; i++) {
          if (list[i].ImageName === blockExeName) {
            this.isSystemBlockerEnabled = true;
            // we found software, stop wasting CPU Cycles
            break;
          } else {
            this.isSystemBlockerEnabled = false;
          }
        }
      });

      // system is legit disabled
      // register that to system and
      // prepare for restart
      if (this.isSystemBlockerEnabled === false) {
        this.systemDisableProc.kill('SIGINT');
        this.systemDisableProc = null;
      }

      return;
    }

    this.systemDisableProc = execFile(filePath);
    this.isSystemBlockerEnabled = true;
    console.log("System Blocked");
  }

  /**
   * disables the system blocker
   */
  disableSystemBlocker() {
    if (this.systemDisableProc) {
      this.systemDisableProc.kill('SIGINT');
      this.systemDisableProc = null;
      this.isSystemBlockerEnabled = false;
    }
  }
}

export default new SystemUtils();