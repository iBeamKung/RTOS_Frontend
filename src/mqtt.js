import React, { useEffect, useState } from 'react';
import mqtt, { PassThrough } from "mqtt/dist/mqtt";
import { Container, Row, Col } from 'react-bootstrap';
import './Custom.css';
import './App.css';
import Swal from 'sweetalert2';
// import mqtt from 'mqtt';

function MyComponent() {
    //const [people, setPeople] = useState('Loading...');
    const [doorlock, setDoorlock] = useState('Loading...');
    const [doorsensor, setDoorsensor] = useState('Loading...');
    const [security, setSecurity] = useState('Loading...');
    const [alert, setAlert] = useState('Loading...');
    const [message, setMessage] = useState('');
    const [isConnected, setIsConnected] = useState(true);
    const [isDisconnected, setIsDisconnected] = useState(false);
    const url = 'mqtt://45.150.128.22:9001';
    const options = {
        // Clean session
        clean: true,
        // Authentication
        clientId: "clientmqtt_" + Math.random().toString(16).substr(2, 8)
    }
    
    const client = mqtt.connect(url, options);

    useEffect(() => {
        client.subscribe('RTOS/esp/status');
        client.subscribe('RTOS/esp/status_door');
        client.subscribe('RTOS/esp/status_lock_1');
        client.subscribe('RTOS/esp/security');
        client.subscribe('RTOS/esp/alert');
        console.log(isDisconnected);
        
          client.on('error', function (error) {
            console.log('MQTT client error:', error);
            setIsConnected(false);
            if (!isDisconnected) {
            setIsDisconnected(true);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong!',
              });
              
            }
          });
          client.on('close', function () {
            console.log('MQTT client disconnected');
            setIsConnected(false);
            if (!isDisconnected) {
            setIsDisconnected(true);
            Swal.fire({
                icon: 'warning',
                title: 'Warning',
                text: 'MQTT client disconnected!',
              });
            }
          });
        client.on('message', function (topic, message) {
            //console.log(topic, message.toString());
            console.log('MQTT client connected');
            setIsConnected(true);
            setIsDisconnected(false);
            const jsonMessage = JSON.parse(message.toString());
            console.log(topic, );
            
       
            if(topic == "RTOS/esp/status")
            {
                console.log("ESP Alive");

                if(jsonMessage.status_lock_1) { setDoorlock("Locked") }
                else { setDoorlock("Unlocked") }

                if(jsonMessage.status_door) { setDoorsensor("Open") }
                else { setDoorsensor("Close") }

                if(jsonMessage.security) { setSecurity("ON") }
                else { setSecurity("OFF") }

                

                //setPeople(jsonMessage.count_pir.toString())
                
            }

            if(topic == "RTOS/esp/status_door")
            {

                if(jsonMessage.status_door) { setDoorsensor("Open") }
                else { setDoorsensor("Close") }
                
            }

            if(topic == "RTOS/esp/status_lock_1")
            {

                if(jsonMessage.status_lock_1) { setDoorlock("Locked") }
                else { setDoorlock("Unlocked") }
                
            }

            if(topic == "RTOS/esp/security")
            {

                if(jsonMessage.security) { setSecurity("ON") }
                else { setSecurity("OFF") }
                
            }

            if(topic == "RTOS/esp/alert")
            {

                setAlert(message.toString())
                //popup here
                
            }

            setMessage(message.toString());
        ;});

        client.publish('RTOS/esp/check_status', JSON.stringify({ clientId:options.clientId }));

        return () => {
            client.end();
        };
        
   }, []);
    
    
    function Lock() {
        client.publish('RTOS/esp/lock_1', JSON.stringify({ lock_1: true }));
    }

    function Unlock() {
        client.publish('RTOS/esp/lock_1', JSON.stringify({ lock_1: false }));
    }

    function OnSec() {
        client.publish('RTOS/esp/security', JSON.stringify({ security: true }));
    }

    function OffSec() {
        client.publish('RTOS/esp/security', JSON.stringify({ security: false }));
    }

    return(
    <Container className="App">
      <Row className="align-items-center ">
        <Col className="custom-border">
            <span>
                <p className="underline-text">version 2.0</p>
            </span>
            <h1 className="text-blue"> Smart Home Security </h1>
            <p>Door Lock Status: <strong>{doorlock}</strong></p>
            <p>Door Sensor Status: <strong>{doorsensor}</strong></p>
            <p>Security Status: <strong>{security}</strong></p>
        </Col>
        <Col className="custom-border">
            <div>
                <p className="button-label">Lock:</p>
                <div className="button-group">
                <button className="button pink" onClick={Lock}>
                    Lock
                </button>
                <button className="button green" onClick={Unlock}>
                    Unlock
                </button>
                </div>
            </div>
            <div>
                <p className="button-label">Security:</p>
                <div className="button-group">
                <button className="button blue" onClick={OnSec}>
                    On
                </button>
                <button className="button orange" onClick={OffSec}>
                    Off
                </button>
                </div>
            </div>
            </Col>
            {/* <p>Received message: {message}</p> */}
            
            </Row>
            
        </Container>
        
    );
}

export default MyComponent;