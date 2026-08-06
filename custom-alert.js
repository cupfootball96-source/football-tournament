// custom-alert.js
(function() {
    // Inject CSS for custom alert
    const style = document.createElement('style');
    style.innerHTML = `
        #customAlertModal {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.7);
            backdrop-filter: blur(10px);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 100000;
            padding: 20px;
        }
        .custom-alert-box {
            background: rgba(15, 20, 30, 0.9);
            border: 1px solid rgba(255, 215, 0, 0.3);
            border-radius: 20px;
            padding: 30px;
            max-width: 400px;
            width: 100%;
            text-align: center;
            box-shadow: 0 15px 40px rgba(0,0,0,0.6);
            animation: customAlertPopupShow 0.4s ease;
        }
        .custom-alert-box p {
            color: #fff;
            font-size: 16px;
            margin-bottom: 25px;
            line-height: 1.5;
            font-family: 'Poppins', sans-serif;
        }
        .custom-alert-box button {
            background: linear-gradient(90deg, #FFD700, #F39C12);
            color: #111;
            border: none;
            padding: 10px 30px;
            border-radius: 30px;
            font-weight: bold;
            cursor: pointer;
            transition: 0.3s;
            font-size: 15px;
            font-family: 'Poppins', sans-serif;
        }
        .custom-alert-box button:hover {
            box-shadow: 0 5px 15px rgba(255, 215, 0, 0.3);
            transform: translateY(-2px);
        }
        @keyframes customAlertPopupShow {
            from { opacity: 0; transform: scale(0.8); }
            to { opacity: 1; transform: scale(1); }
        }
    `;
    document.head.appendChild(style);

    // Alert Function
    function showCustomAlert(message) {
        let modal = document.getElementById("customAlertModal");
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "customAlertModal";
            modal.innerHTML = `
                <div class="custom-alert-box">
                    <p id="customAlertMessage"></p>
                    <button type="button" id="customAlertBtn">OK</button>
                </div>
            `;
            document.body.appendChild(modal);

            document.getElementById("customAlertBtn").addEventListener("click", () => {
                modal.style.display = "none";
            });
        }

        document.getElementById("customAlertMessage").innerHTML = String(message).replace(/\n/g, "<br>");
        modal.style.display = "flex";
    }

    // Override native alert
    window.alert = function(msg) {
        showCustomAlert(msg);
    };
})();
