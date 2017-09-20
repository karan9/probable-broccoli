import * as macFinder from 'getmac';


class MacUtil {

  constructor() {
    this.currentMac = null;

    this._getMacAsync();
  }

  _getMacAsync() {
    macFinder.getMac((err, macAddr) => {
      
      /**
       * TODO: Handle if mac address is not found
       */
      if (err) {
        // no mac addr found
      }

      this.currentMac = macAddr;
    });
  }

  /**
   * @returns {number}
   */
  getMacAddr() {
    return this.currentMac;
  }

}


export default new MacUtil();