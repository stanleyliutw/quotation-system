(function () {
    "use strict";

    const firebaseConfig = {
        apiKey: "AIzaSyB9eYIZv8i2c_ljAMoio8csB2-RKWMwmMQ",
        authDomain: "windner-document.firebaseapp.com",
        databaseURL: "https://windner-document-default-rtdb.firebaseio.com",
        projectId: "windner-document",
        storageBucket: "windner-document.firebasestorage.app",
        messagingSenderId: "285395707143",
        appId: "1:285395707143:web:b23ba25a15e3cc099f11a2",
        measurementId: "G-GKJQ6NR9NV"
    };

    const currentPage = decodeURIComponent(window.location.pathname.split("/").pop() || "index.html");
    const isPublicPage = currentPage === "login.html";
    document.documentElement.classList.add("auth-pending");

    const style = document.createElement("style");
    style.textContent = `
        html.auth-pending body { visibility: hidden; }
        #auth-session-badge {
            position: fixed; right: 16px; bottom: 16px; z-index: 99999;
            display: flex; align-items: center; gap: 10px; max-width: calc(100vw - 32px);
            padding: 9px 10px 9px 14px; border: 1px solid #dbe3ee; border-radius: 999px;
            background: rgba(255,255,255,.96); color: #334155;
            box-shadow: 0 8px 24px rgba(15,23,42,.14);
            font: 600 12px/1.2 Inter, "Noto Sans TC", sans-serif;
        }
        #auth-session-badge span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        #auth-session-badge button {
            border: 0; border-radius: 999px; padding: 7px 11px; cursor: pointer;
            background: #1a237e; color: #fff; font: inherit;
        }
        #auth-session-badge button:hover { background: #303f9f; }
        #auth-fatal-error {
            position: fixed; inset: 0; z-index: 100000; display: grid; place-items: center;
            padding: 24px; background: #f8fafc; color: #991b1b;
            font: 600 16px/1.7 Inter, "Noto Sans TC", sans-serif; text-align: center;
        }
        @media print { #auth-session-badge { display: none !important; } }
    `;
    document.head.appendChild(style);

    if (!window.firebase || !firebase.auth) {
        showFatalError("登入元件載入失敗，請檢查網路連線後重新整理。");
        return;
    }

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    const auth = firebase.auth();
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch((error) => {
        console.error("無法設定登入保存狀態:", error);
    });

    window.firebaseAuth = auth;
    window.firebaseAuthReady = new Promise((resolve, reject) => {
        auth.onAuthStateChanged((user) => {
            window.currentFirebaseUser = user || null;

            if (!user && !isPublicPage) {
                sessionStorage.setItem("authReturnTo", getCurrentRelativeUrl());
                window.location.replace("login.html");
                return;
            }

            document.documentElement.classList.remove("auth-pending");
            if (user && !isPublicPage) renderSessionBadge(user);
            resolve(user || null);
        }, (error) => {
            console.error("Firebase 登入狀態讀取失敗:", error);
            document.documentElement.classList.remove("auth-pending");
            showFatalError("無法確認登入狀態，請稍後重新整理。", error);
            reject(error);
        });
    });

    window.logoutFromSystem = async function () {
        try {
            await auth.signOut();
            window.location.replace("login.html");
        } catch (error) {
            console.error("登出失敗:", error);
            alert("登出失敗，請稍後再試。");
        }
    };

    function getCurrentRelativeUrl() {
        const file = window.location.pathname.split("/").pop() || "index.html";
        return file + window.location.search + window.location.hash;
    }

    function renderSessionBadge(user) {
        const render = () => {
            if (document.getElementById("auth-session-badge")) return;

            const badge = document.createElement("div");
            badge.id = "auth-session-badge";

            const email = document.createElement("span");
            email.textContent = user.email || "已登入";
            email.title = user.email || "已登入";

            const logoutButton = document.createElement("button");
            logoutButton.type = "button";
            logoutButton.textContent = "登出";
            logoutButton.addEventListener("click", window.logoutFromSystem);

            badge.append(email, logoutButton);
            document.body.appendChild(badge);
        };

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", render, { once: true });
        } else {
            render();
        }
    }

    function showFatalError(message, error) {
        document.documentElement.classList.remove("auth-pending");
        const render = () => {
            const box = document.createElement("div");
            box.id = "auth-fatal-error";
            box.textContent = message;
            if (error && error.message) box.title = error.message;
            document.body.appendChild(box);
        };

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", render, { once: true });
        } else {
            render();
        }
    }
})();
