import MacUtil from './MacUtil';
import axios from 'axios';
import queryString from 'querystring';
import os from 'os';

import SystemUtils from './SystemUtils';

class Server {

  constructor() {
    this.SERVER_INTERVAL = 5000;
    this.serverInterval = null;
  }

  /**
   * check the response from server
   * 
   * @param {*} res 
   */
  _checkServerResponse(res) {
    console.log("Next Payment Date is " + res.data.data.next_payment_date);
    

    // check if System is Blocked
    if (Number(res.data.data.is_system_enabled) === 1) {
      console.log("Disabling Software Blocker");
      SystemUtils.disableSystemBlocker();
    } else {
      console.log("Enabling Software Blocker")
      SystemUtils.enableSystemBlocker();
    }

    // check if Remote is Disabled
    if (Number(res.data.data.is_remote_enabled) === 1) {
      SystemUtils.disableSoftwareKill();
    } else {
      SystemUtils.enableSoftwareKill();
    }
  }

  /**
   * 
   * start checking server
   */
  _checkServer() {
    axios.get("http://lawenforcement.online/api/user/find/mac", {
      params: {
        mac: MacUtil.getMacAddr()
      }
    })
    .then((res) => this._checkServerResponse(res))
    .catch((err) => console.log(err.response))
  }

  enableServerInterval() {
    if (this.serverInterval) {
      // interval already running
      return;
    }

    this.serverInterval = setInterval(this._checkServer.bind(this), this.SERVER_INTERVAL);
  }


  disableServerInterval() {
    if (!this.serverInterval) {
      // Server interval is already off
      return;
    }

    clearInterval(this.serverInterval);
    this.serverInterval = null;
  }

}

export default new Server();