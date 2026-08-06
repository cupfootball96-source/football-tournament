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
        #customConfirmModal {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.75);
            backdrop-filter: blur(10px);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 100001;
            padding: 20px;
        }
        .custom-confirm-box {
            background: rgba(15, 20, 30, 0.95);
            border: 1px solid rgba(255, 80, 80, 0.4);
            border-radius: 20px;
            padding: 30px;
            max-width: 420px;
            width: 100%;
            text-align: center;
            box-shadow: 0 20px 50px rgba(0,0,0,0.7);
            animation: customAlertPopupShow 0.3s ease;
        }
        .custom-confirm-box .confirm-icon {
            font-size: 40px;
            margin-bottom: 15px;
        }
        .custom-confirm-box h4 {
            color: #fff;
            font-size: 18px;
            font-family: 'Poppins', sans-serif;
            margin-bottom: 10px;
        }
        .custom-confirm-box p {
            color: rgba(255,255,255,0.7);
            font-size: 14px;
            margin-bottom: 25px;
            line-height: 1.5;
            font-family: 'Poppins', sans-serif;
        }
        .custom-confirm-actions {
            display: flex;
            gap: 12px;
            justify-content: center;
        }
        .custom-confirm-actions button {
            padding: 10px 28px;
            border-radius: 30px;
            font-weight: bold;
            cursor: pointer;
            font-size: 14px;
            font-family: 'Poppins', sans-serif;
            border: none;
            transition: all 0.2s ease;
        }
        .custom-confirm-actions button:hover { transform: translateY(-2px); }
        .confirm-cancel-btn {
            background: rgba(255,255,255,0.1);
            color: #fff;
            border: 1px solid rgba(255,255,255,0.2) !important;
        }
        .confirm-cancel-btn:hover { background: rgba(255,255,255,0.18) !important; }
        .confirm-ok-btn {
            background: linear-gradient(90deg, #ff4444, #cc0000);
            color: #fff;
            box-shadow: 0 4px 15px rgba(255,68,68,0.3);
        }
        .confirm-ok-btn:hover { box-shadow: 0 6px 20px rgba(255,68,68,0.5) !important; }
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

    // Custom Confirm (Promise-based)
    function showCustomConfirm(title, message) {
        return new Promise((resolve) => {
            let modal = document.getElementById("customConfirmModal");
            if (!modal) {
                modal = document.createElement("div");
                modal.id = "customConfirmModal";
                modal.innerHTML = `
                    <div class="custom-confirm-box">
                        <div class="confirm-icon">⚠️</div>
                        <h4 id="customConfirmTitle"></h4>
                        <p id="customConfirmMessage"></p>
                        <div class="custom-confirm-actions">
                            <button type="button" class="confirm-cancel-btn" id="customConfirmCancel">Cancel</button>
                            <button type="button" class="confirm-ok-btn" id="customConfirmOk">Delete</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);
            }

            document.getElementById("customConfirmTitle").textContent = title;
            document.getElementById("customConfirmMessage").textContent = message;
            modal.style.display = "flex";

            const okBtn = document.getElementById("customConfirmOk");
            const cancelBtn = document.getElementById("customConfirmCancel");

            const cleanup = () => { modal.style.display = "none"; };

            const onOk = () => { cleanup(); okBtn.removeEventListener("click", onOk); cancelBtn.removeEventListener("click", onCancel); resolve(true); };
            const onCancel = () => { cleanup(); okBtn.removeEventListener("click", onOk); cancelBtn.removeEventListener("click", onCancel); resolve(false); };

            okBtn.addEventListener("click", onOk);
            cancelBtn.addEventListener("click", onCancel);
        });
    }

    window.showConfirm = showCustomConfirm;
})();
