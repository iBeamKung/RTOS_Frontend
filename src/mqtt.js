import React, { useEffect, useState } from 'react';
import mqtt from "mqtt/dist/mqtt";

function MyComponent() {
    //const [people, setPeople] = useState('Loading...');
    const [doorlock, setDoorlock] = useState('Loading...');
    const [doorsensor, setDoorsensor] = useState('Loading...');
    const [security, setSecurity] = useState('Loading...');
    const [alert, setAlert] = useState('Loading...');
    const [message, setMessage] = useState('');

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

        client.on('message', function (topic, message) {
            //console.log(topic, message.toString());
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
        });

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
        <div>
            Smart Home Security
            <p>Door Lock Status: {doorlock}</p>
            <p>Door Sensor Status: {doorsensor}</p>
            <p>Security Status: {security}</p>

            <p>Lock:</p>
            <button onClick={Lock}>
                Lock!
            </button>
            <button onClick={Unlock}>
                Unlock!
            </button>

            <p>Security:</p>
            <button onClick={OnSec}>
                On!
            </button>
            <button onClick={OffSec}>
                Off!
            </button>

            <p>Received message: {message}</p>
        </div>
    );
}

export default MyComponent;