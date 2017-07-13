(function() {

    function SpeechRecognition() {

        // ========================================================================
        // Speech recognition functions start
        // ========================================================================
        var recognition;

        var self = this;

        this.restart = function () {
            setTimeout(function() {
                self.start()
            }, 1000)
        }

        this.onresult = function (text) {
            // Do nothing with the result
            var cmd = parseCommand(text);
            cmd && self.onCommand(cmd);
        };

        this.onend = function () {
            // Do nothing with the result
        };

        this.onCommand = function (cmd) {
            // Do nothing with the result
        };

        this.start = function(forceRestart) {
            forceRestart = forceRestart ? true : false;
            // Stop before start
            if(forceRestart == false && recognition) {
                console.log("Already listening")
                return;
            }

            try {
                recognition = new webkitSpeechRecognition();
            } catch (e) {
                recognition = { available: "not available" };
                recognition.start = function() {
                    console.warning("This browser does not support accessing the microphone.");
                }
                recognition.stop = function() {
                    console.warning("This browser does not support accessing the microphone.");
                }
            }

            recognition.onstart = function() {
                console.log("SR start");
            }

            recognition.onresult = function(event) {
                var text = ""
                for (var i = event.resultIndex; i < event.results.length; ++i) {
                    text += event.results[i][0].transcript
                }
                console.log("Speech recognition result: " + text)
                self.onresult(text)
            }

            recognition.onend = function() {
                console.log("SR end");
                self.stop()
                self.onend()
            }

            recognition.lang = "en-US";
            recognition.start();
        }

        this.stop = function () {
            if (recognition) {
                if (!recognition.available) {
                }
                recognition.stop();
                recognition = null;
            }
        }

        this.toggleSR = function toggleStartandStop() {
            if (recognition) {
                self.stop()
            } else {
                self.start()
            }
        }

        function parseCommand(text) {
            text = text.toLowerCase();

            // text = text.split(' ')
            // if(text.length > 0) {
            //     if('jarvis' == text[0]) {
            //         text.splice(0, 1)
            //         return text.join(' ')
            //     }
            // }
            return text;
        }
    };


    $(document).ready(function() {

        var isActive = true;
        var canAutoStart = true;
        var manualStopped = false;
        var sr = new SpeechRecognition()

        var commandText = $('#speech-text')
        var micButton = $('#mic-btn')

        sr.start()

        sr.onend = function () {
            if(isActive) {
                console.info(canAutoStart ? "Restart SR" : "No SR restart")
                !manualStopped && canAutoStart && sr.restart();
            } else {
                console.info("No SR Restart")
            }
        }

        sr.onCommand = function (command) {
            console.log("Command:" + command);
            setCommandText(command)

            if (command.indexOf('go to ') != -1) {
                command = $.trim(command.replace('go to ', ''))
                var url = 'http://www.' + command + ".com"
                window.open(url)
            } else if (command.indexOf('search ') != -1) {
                command = $.trim(command.replace('search ', ''))
                command = command.replace(' ', '+')
                var url = 'https://www.google.co.in/search?q='+command
                window.open(url)
            }
        }

        function setCommandText(command) {
            commandText.val(capitalizeFirstLetter(command))
        }

        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

        // ========================================================================
        // Event Listeners
        // ========================================================================
        
        // On window Focus, start listening for the commands
        $(window).on("blur focus", function(e) {
            var prevType = $(this).data("prevType");

            if (prevType != e.type) {
                switch (e.type) {
                    case "blur":
                        isActive = false;
                        // console.info("Tab is not focussed")
                        break;

                    case "focus":
                        // console.info("Tab is focussed")
                        isActive = true;
                        !manualStopped && canAutoStart && sr.restart()
                        break;
                }
            }

            $(this).data("prevType", e.type);
        })

        $('#autostart').change(function (event) {
            var checked = $(this)[0].checked;
            canAutoStart = checked;
            console.log("SR Autostart: " + checked);
        });

        commandText.keypress(function(event) {
            if (13 == event.which) {
                
            } else {
                
            }
        });

        micButton.click(function () {
            // Toggle Button color between red and green
            micButton.toggleClass('red green')

            manualStopped = true;

            // Start listening, if already started stop listening
            sr.stop()
        })

        // ========================================================================
        // Event Listeners end
    })
})()
