import { execFile } from 'child_process'; 
import path from 'path';
import os from 'os';
import * as win from 'node-windows';
import sp from 'sudo-prompt';

import Server from './Server';

class SystemUtils {

  constructor() {

    this.systemDisableProc = null;
    this.isSystemBlockerEnabled = false;
    this.softwareKillInterval = null;
    this.isKillEnabledByBlocker = false;
    this.SOFTWARE_KILL_INTERVAL = 1300;

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

  killSoftwares() {
    win.list((list) => {
      list.forEach((element) => {
        if (this.SOFTWARE_KILL_LIST.indexOf(element.ImageName) >= 0) {
          win.kill(element.PID, (err) => {
            if (err) {
              Server.disableServerInterval();
              this.disableSoftwareKill();
              
              let cmd = `taskkill /PID ${element.PID} /F /T`;
              sp.exec(cmd, {
                name: 'Web Security Connect'
              }, (err, stdout, stderr) => {
                this.enableSoftwareKill();
                Server.enableServerInterval();
              });
  
              return;
            }
            // DEBUG_LOG
            console.log("Program Killed");
          });
        }
      });
    });
  }

  /**
   * enables the Software Killer
   */
  enableSoftwareKill() {
    if (this.softwareKillInterval) {
      // kill already running
      return;
    }

    /* setup kill interval */
    this.softwareKillInterval = setInterval(this.killSoftwares.bind(this), this.SOFTWARE_KILL_INTERVAL);

    console.log("Enabling Software Killer");
  }

  /**
   * 
   * disables the Software Killer
   */
  disableSoftwareKill() {
    if (this.softwareKillInterval) {

      if (this.isKillEnabledByBlocker) {
        return;
      }

      clearInterval(this.softwareKillInterval);
      this.softwareKillInterval = null;
      console.log("Software Killer Disabled");
    }
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

    // enable software killer
    this.isKillEnabledByBlocker = true;
    this.enableSoftwareKill();

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
    // disable software killer
    this.isKillEnabledByBlocker = false;
    this.disableSoftwareKill();
    
    if (this.systemDisableProc) {
      this.systemDisableProc.kill('SIGINT');
      this.systemDisableProc = null;
      this.isSystemBlockerEnabled = false;
    }
  }
}

export default new SystemUtils();