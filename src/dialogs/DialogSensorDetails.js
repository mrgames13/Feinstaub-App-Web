import React from "react";
import PropTypes from "prop-types";
import request from "superagent";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import moment from "moment";
import strings from "../strings";
import * as Constants from "../constants";

class DialogSensorDetails extends React.Component {
  state = {
    public: false,
    firmwareVersion: strings.loading,
    creationDate: strings.loading,
    lat: strings.loading,
    lng: strings.loading,
    alt: strings.loading,
  };

  constructor(props) {
    super(props);
    this.loadSensorDetails();
  }

  loadSensorDetails = () => {
    //Serveranfrage machen
    let currentComponent = this;
    request.post(Constants.BACKEND_URL)
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send({ command: "issensorexisting", chip_id: this.props.chipId })
      .end(function(err, res) {
        var result = res.text.trim();
        if(result === "1") {
          request.post(Constants.BACKEND_URL)
            .set("Content-Type", "application/x-www-form-urlencoded")
            .send({ command: "getsensorinfo", chip_id: currentComponent.props.chipId })
            .end(function(err, res) {
              var result = res.text.trim();
              var obj = JSON.parse(result)[0];
              var alt = obj.alt + "m";

              currentComponent.setState({
                creationDate: moment.unix(obj.creation_date).format("DD.MM.YYYY"),
                firmwareVersion: obj.firmware_version,
                public: true,
                lat: obj.lat,
                lng: obj.lng,
                alt,
              });
            });
        } else {
          currentComponent.setState({
            creationDate: "-",
            firmwareVersion: "-",
            public: false,
            lat:  "-",
            lng:  "-",
            alt:  "-",
          });
        }
      });
  }

  render() {
    return (
      <Dialog open={this.props.opened} onClose={this.props.onClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" >
        <DialogTitle id="alert-dialog-title">{strings.sensorDetails}</DialogTitle>
        <DialogContent>
          <table width="350">
            <tbody>
              <tr>
                <td><b>{strings.displayName}:</b></td>
                <td align="right">{this.props.name}</td>
              </tr>
              <tr>
                <td><b>{strings.chipId}:</b></td>
                <td align="right">{this.props.chipId}</td>
              </tr>
              <tr>
                <td><b>{strings.public}:</b></td>
                <td align="right">{this.state.public ? "Ja" : "Nein"}</td>
              </tr>
              <tr>
                <td><b>{strings.firmwareVersion}:</b></td>
                <td align="right">{this.state.firmwareVersion}</td>
              </tr>
              <tr>
                <td><b>{strings.onlineSince}:</b></td>
                <td align="right">{this.state.creationDate}</td>
              </tr>
              <tr>
                <td><b>{strings.latitude}:</b></td>
                <td align="right">{this.state.lat}</td>
              </tr>
              <tr>
                <td><b>{strings.longitude}:</b></td>
                <td align="right">{this.state.lng}</td>
              </tr>
              <tr>
                <td><b>{strings.mountingHeight}:</b></td>
                <td align="right">{this.state.alt}</td>
              </tr>
            </tbody>
          </table>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.onClose} color="primary" autoFocus>{strings.ok}</Button>
        </DialogActions>
      </Dialog>
    );
  }
}

DialogSensorDetails.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  chipId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};

export default DialogSensorDetails;
