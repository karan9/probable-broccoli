import MacUtil from './MacUtil';
import axios from 'axios';
import queryString from 'querystring';
import os from 'os';

class User {

  /**
   * @constructor
   */
  constructor() {
    this.DEBUG = true;
    this.successCallback = null;
    this.errorCallback = null;
    this.currentMac = null;
  }

  _setCurrentMac(mac) {
    this.currentMac = mac;
  }

  _getCurrentMac() {
    return this.currentMac
  }

  _checkIfRegisterationSuccessfull(res) {
    let resCode = Number(res.data.error_code);
    switch(resCode) {
      case 200:
        this.successCallback("User is Successfully Registered");
        console.log("Mac is " + this._getCurrentMac());
        break;
      case 404:
        this.successCallback("Unable to register user");
        console.log("Mac is " + this._getCurrentMac());
        break;
      default:
        console.log("Default called, You fucked somewhere in register process");
    }
  }

  _registerUser() {
    const URL = {
      USER_FIND: 'http://lawenforcement.online/api/user/find/mac',
      USER_REGISTER: 'http://lawenforcement.online/api/user/register/mac'
    }

    axios.post("http://lawenforcement.online/api/user/register/mac", queryString.stringify({
      mac: this._getCurrentMac(),
      username: os.userInfo().username
    }))
    .then((res) => this._checkIfRegisterationSuccessfull(res))
    .catch((err) => console.log(err))
  }

  /**
   *  check if user is already registered
   */
  _checkAlreadyUserRegistered(res) {

    let resCode = Number(res.data.error_code);

    console.log(resCode);
    switch(resCode) {
      case 200:
        this.successCallback("User is Already Registered, Begin Checking Server");
        console.log("Mac is: " + this._getCurrentMac());
        break;
      case 404:
        this.successCallback("User Not Found, Starting Registeration Process");
        
        // trigger register user if user is not found
        this._registerUser();

        console.log("Mac is: " + this._getCurrentMac());
        break;
      default:
        console.log("Default called, You fucked somewhere in init process");
    }
  }


  /**
   * 
   * @param {callback} success 
   * @param {callback} error 
   */
  _isUserAlreadyRegistered() {
    
    const URL = {
      USER_FIND: 'http://lawenforcement.online/api/user/find/mac',
      USER_REGISTER: 'http://lawenforcement.online/api/user/register/mac'
    }

    axios.get(URL.USER_FIND, {
      params: {
        mac: this._getCurrentMac()
      }
    })
    .then((res) => this._checkAlreadyUserRegistered(res))
    .catch((reason) => this._checkAlreadyUserRegistered(reason.response));
  }


  /**
   * initiate the process
   * 
   * @param {*} success 
   * @param {*} error 
   */
  init(success, error) {
    if (this.DEBUG) {
      console.log("User Started");
    }

    this.successCallback = success;
    this.errorCallback = error;

    this._setCurrentMac(MacUtil.getMacAddr());

    if (!this._getCurrentMac()) {
      console.log("Error, Mac Address Not Found");
      return;
    } else {
      console.log("Mac Address is " +  this._getCurrentMac())
    }
    
    this._isUserAlreadyRegistered();
  }
}


export default new User();