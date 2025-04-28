// src/components/Navbar.jsx
import { Link, useLocation } from "react-router-dom";
import {
  LineChart,
  BarChart3,
  KeyRound,
  Menu,
  X,
  Sun,
  Moon,
  BrainCircuit,
  SunMoon,
  Bell,
  BellRing,
  Trash2,
  Check
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect, useContext, createContext } from "react";
import AccessModal from "./AccessModal";
import mqttInstance from "../utils/mqttClient";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
//imports use callback
import { useCallback, useRef } from "react";
let messageLock = false;
let lastMessageHash = '';
let lastProcessedTime = 0;

// Contexto de notificaciones
const NotificationsContext = createContext();


export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);


  const addNotification = useCallback((notification) => {
 

    const newId = Date.now() + Math.random();
    setNotifications(prev => [{
      id: newId,
      ...notification,
      read: false
    }, ...prev]);
  }, []);


  const markAsRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? {...n, read: true} : n)
    );
  }, []); // Referencia estable


  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []); // Referencia estable


  const contextValue = { notifications, addNotification, markAsRead, clearAll };

  return (
    <NotificationsContext.Provider value={contextValue}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);

// Componente de campana de notificaciones
const NotificationBell = () => {
  const { notifications, markAsRead, clearAll } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const playNotificationSound = () => {
    console.log("Reproduciendo sonido de notificación");
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setShowNotifications(!showNotifications)}
        className="p-2 rounded-full hover:bg-gray-700 transition relative"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-5 h-5 text-amber-400" />
        ) : (
          <Bell className="w-5 h-5 text-gray-300" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs 
                          rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-72 bg-gray-800 rounded-lg shadow-xl 
                       border border-gray-700 overflow-hidden z-50">
          <div className="p-3 border-b border-gray-700 flex justify-between items-center">
            <h3 className="font-medium text-gray-200">Notificaciones</h3>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                clearAll();
              }}
              className="text-xs text-gray-400 hover:text-red-400 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Limpiar
            </button>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-sm">
                No hay notificaciones
              </div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.id}
                  className={`p-3 border-b border-gray-700 hover:bg-gray-700/50 cursor-pointer 
                             ${!notification.read ? 'bg-gray-800/70' : ''}`}
                  onClick={() => {
                    markAsRead(notification.id);
                    if (notification.urgent) playNotificationSound();
                  }}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className={`text-sm font-medium ${
                        notification.type === 'danger' ? 'text-red-400' :
                        notification.type === 'warning' ? 'text-amber-400' :
                        'text-blue-400'
                      }`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-400">{notification.message}</p>
                    </div>
                    {!notification.read && (
                      <span className="bg-blue-500 rounded-full w-2 h-2 flex-shrink-0 mt-1.5"></span>
                    )}
                  </div>
                  <div className="text-right mt-1">
                    <span className="text-xs text-gray-500">
                      {new Date(notification.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function Navbar() {
  const location = useLocation();
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [lightMode, setLightMode] = useState(2);
  const [connectionStatus, setConnectionStatus] = useState("Conectando...");
  const { addNotification } = useNotifications();


  const showAlertToast = useCallback((title, message, type, withSound = false) => {
    const getIcon = () => {
      switch(type) {
        case 'danger': return '🔥';
        case 'warning': return '⚠️';
        case 'security': return '🚨';
        default: return 'ℹ️';
      }
    }

    toast(
      <div className="flex items-start gap-3">
        <span className="text-xl mt-0.5">{getIcon()}</span>
        <div>
          <p className="text-sm font-medium text-gray-100">{title}</p>
          <p className="text-xs text-gray-400">{message}</p>
        </div>
      </div>,
      {
        className: `border-l-4 ${type === 'danger' ? 'border-red-500' : 
                   alert.type === 'warning' ? 'border-amber-500' : 'border-blue-500'}`,
        autoClose: 3000,
        hideProgressBar: true,
        bodyClassName: "py-2",
        onOpen: withSound ? () => {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/1743/1743-preview.mp3');
          if (audio.canPlayType('audio/mpeg')) {
            audio.volume = 0.02;
            audio.play().catch(e => console.log("Error al reproducir sonido:", e));
          } else {
            console.log("Formato de audio no soportado");
          }
        } : undefined
      }
    );
  }, []);


  const handleMessage = useCallback((topic, message) => {
    const now = Date.now();

    const messageHash = '${topic}_${message.toString().substring(0, 50)}';

    if (messageHash === lastMessageHash) {
      console.log("Mensaje duplicado, ignorando...");
      return;
    }

    if (messageLock || (now - lastProcessedTime < 3000)) {
      return;
    }

    messageLock = true;
  lastMessageHash = messageHash;
  lastProcessedTime = now;


        try {
          const cleanedMessage = message.toString()
            .replace(/\u00A0/g, " ")
            .replace(/[^\x20-\x7E]/g, "");
          const parsedMessage = JSON.parse(cleanedMessage);
          console.log("Mensaje recibido:", parsedMessage);
  
          // Generar alertas
          if (parsedMessage.temperatura > 35) {
            const alert = {
              type: 'danger',
              title: 'Temperatura peligrosa',
              message: `Temperatura alcanzó ${parsedMessage.temperatura}°C`,
              sensor: 'temperatura',
              value: parsedMessage.temperatura,
              urgent: true
            };
            addNotification(alert);
            showAlertToast(alert.title, alert.message, 'danger');
          }
  
          if (parsedMessage.humedad > 50) {
            const alert = {
              type: 'warning',
              title: 'Humedad alta',
              message: `Humedad alcanzó ${parsedMessage.humedad}%`,
              sensor: 'humedad',
              value: parsedMessage.humedad
            };
            addNotification(alert);
            showAlertToast(alert.title, alert.message, 'warning');
          }
  
          if (parsedMessage.corriente > 1) {
            const alert = {
              type: 'danger',
              title: 'Corriente elevada',
              message: `Corriente medida: ${parsedMessage.corriente}A`,
              sensor: 'corriente',
              value: parsedMessage.corriente,
              urgent: true
            };
            addNotification(alert);
            showAlertToast(alert.title, alert.message, 'danger', true);
          }
  
          if (parsedMessage.calidadAire > 400) {
            const alert = {
              type: 'warning',
              title: 'Calidad de aire baja',
              message: `Calidad de aire medida: ${parsedMessage.calidadAire}`,
              sensor: 'calidadAire',
              value: parsedMessage.calidadAire
            };
            addNotification(alert);
            showAlertToast(alert.title, alert.message, 'warning');
          }
  
          if (parsedMessage.puerta === 1) {
            const alert = {
              type: 'security',
              title: 'Acceso detectado',
              message: 'Se detectó acceso al datacenter',
              sensor: 'puerta',
              value: parsedMessage.puerta,
              urgent: true
            };
            addNotification(alert);
            showAlertToast(alert.title, alert.message, 'security', true);
          }
  
        } catch (error) {
          console.error("Error al procesar el mensaje:", error);
          lastMessageHash = ''; // Reiniciar el hash del último mensaje
          lastProcessedTime = 0; // Reiniciar el tiempo del último procesamiento
        
  
  
    } finally {
      setTimeout(() => {
        messageLock = false;
        lastMessageHash = ''; // Reiniciar el hash del último mensaje
      }, 100);
    }
  }, [addNotification, showAlertToast]);
  

  

  useEffect(() => {
    const client = mqttInstance.getClient();
    const topic = "dataCenter/sensores";

    const updateStatus = () => {
      setConnectionStatus(client.connected ? "Conectado" : "Desconectado");
    };

    

    client.on("connect", () => {
      updateStatus();
      console.log("Conexión establecida");
    });
  
    client.on("reconnect", () => {
      setConnectionStatus("Reconectando...");
    });
  
    client.on("offline", () => {
      updateStatus();
    });
  
    client.on("error", (err) => {
      console.error("Error MQTT:", err);
      setConnectionStatus("Error de conexión");
    });

    client.on("connect", () => {
      updateStatus();
      console.log("Conexión establecida");
    });
  
    client.on("reconnect", () => {
      setConnectionStatus("Reconectando...");
    });
  
    client.on("offline", () => {
      updateStatus();
    });
  
    client.on("error", (err) => {
      console.error("Error MQTT:", err);
      setConnectionStatus("Error de conexión");
    });

    client.subscribe(topic, { qos: 1 }, (err) => {
      if (err) {
        console.error("Error al suscribirse al topic:", err);
      } else {
        console.log(`Suscrito al topic: ${topic}`);
        client.on("message", handleMessage);
      }
    });

    updateStatus();
    return () => {
      // Limpiar listeners si desmontas el componente
      client.off("connect", updateStatus);
      client.off("reconnect", () => setConnectionStatus("Reconectando..."));
      client.off("offline", updateStatus);
      client.off("error", () => setConnectionStatus("Error de conexión"));
      client.off("message", handleMessage);
      client.unsubscribe(topic);
    };

  }, [addNotification]);

  const handleLightToggle = (newMode) => {
    const MQTT_TOPIC = "dataCenter/comandos";
    setLightMode(newMode);
    const payload = JSON.stringify({ luzV: newMode });

    const published = mqttInstance.publish(MQTT_TOPIC, payload);

    if (published) {
      const modeData = {
        0: {
          icon: <Moon className="w-3.5 h-3.5 text-indigo-400/90" />,
          text: "Luces apagadas",
        },
        1: {
          icon: <Sun className="w-3.5 h-3.5 text-amber-400/90" />,
          text: "Luces encendidas",
        },
        2: {
          icon: <SunMoon className="w-3.5 h-3.5 text-emerald-400/90" />,
          text: "Luces automáticas",
        },
      };

      toast(
        <div className="flex items-center gap-3 pl-1">
          <div className="flex-shrink-0">{modeData[newMode].icon}</div>
          <div>
            <p className="text-sm font-light text-gray-300/95">
              {modeData[newMode].text}
            </p>
            <p className="text-xs text-gray-500">Ajuste de iluminación</p>
          </div>
        </div>,
        {
          className: "",
          autoClose: 1800,
          hideProgressBar: true,
        }
      );
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <nav className="fixed top-0 w-full bg-gray-900/95 backdrop-blur-sm shadow-xl z-50 h-16 border-b border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="text-xl font-bold text-white flex items-center gap-2"
          >
            <span className="text-blue-400">DataCenter</span> Monitor
          </Link>

          {/* Menú para desktop */}
          <div className="hidden md:flex gap-4 lg:gap-6 items-center">
            <NavLink
              to="/"
              icon={<LineChart />}
              text="En Vivo"
              active={location.pathname === "/"}
            />
            <NavLink
              to="/sensor"
              icon={<BarChart3 />}
              text="Detalle Sensor"
              active={location.pathname === "/sensor"}
            />
            <NavLink
              to="/predictions"
              icon={<BrainCircuit />}
              text="Predicciones"
              active={location.pathname === "/predictions"}
            />

            {/* Controles */}
            <div className="flex items-center gap-4">
              <NotificationBell />
              
              <div
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                  connectionStatus === "Conectado"
                    ? "bg-emerald-900/30 text-emerald-400 border border-emerald-800"
                    : connectionStatus === "Reconectando..."
                    ? "bg-amber-900/30 text-amber-400 border border-amber-800"
                    : "bg-red-900/30 text-red-400 border border-red-800"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    connectionStatus === "Conectado"
                      ? "bg-emerald-400 animate-pulse"
                      : connectionStatus === "Reconectando..."
                      ? "bg-amber-400 animate-pulse"
                      : "bg-red-400"
                  }`}
                ></div>
                {connectionStatus}
              </div>

              <div className="relative bg-gray-800 rounded-full p-1 shadow-lg border border-gray-700">
                <div className="flex relative z-10">
                  <LightSwitchButton
                    active={lightMode === 0}
                    onClick={() => handleLightToggle(0)}
                    icon={<Moon className="w-4 h-4" />}
                    title="Apagar luces"
                    color="bg-indigo-600"
                  />
                  <LightSwitchButton
                    active={lightMode === 2}
                    onClick={() => handleLightToggle(2)}
                    icon={<SunMoon className="w-4 h-4" />}
                    title="Modo automático"
                    color="bg-emerald-600"
                    isMiddle
                  />
                  <LightSwitchButton
                    active={lightMode === 1}
                    onClick={() => handleLightToggle(1)}
                    icon={<Sun className="w-4 h-4" />}
                    title="Encender luces"
                    color="bg-amber-500"
                  />
                </div>
                <div className="absolute inset-0 rounded-full opacity-20 bg-gradient-to-r from-indigo-500 via-emerald-500 to-amber-500 blur-sm"></div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAccessModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md"
            >
              <KeyRound className="w-4 h-4" />
              Acceso Seguro
            </motion.button>
          </div>

          {/* Botón de menú móvil */}
          <button
            className="md:hidden text-gray-300 hover:text-white focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Menú móvil */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-gray-800/95 backdrop-blur-sm pb-4 px-4 border-b border-gray-700">
            <div className="flex flex-col space-y-2">
              <MobileNavLink
                to="/"
                icon={<LineChart size={18} />}
                text="En Vivo"
                active={location.pathname === "/"}
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <MobileNavLink
                to="/sensor"
                icon={<BarChart3 size={18} />}
                text="Detalle Sensor"
                active={location.pathname === "/sensor"}
                onClick={() => setIsMobileMenuOpen(false)}
              />

              <MobileNavLink
                to="/predictions"
                icon={<BrainCircuit size={18} />}
                text="Predicciones"
                active={location.pathname === "/predictions"}
                onClick={() => setIsMobileMenuOpen(false)}
              />

              {/* Interruptor de luces para móvil */}
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Estado:</span>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      connectionStatus === "Conectado"
                        ? "bg-emerald-900/30 text-emerald-400"
                        : connectionStatus === "Reconectando..."
                        ? "bg-amber-900/30 text-amber-400"
                        : "bg-red-900/30 text-red-400"
                    }`}
                  >
                    {connectionStatus}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-gray-700 rounded-lg p-2">
                  <span className="text-gray-300 text-sm">
                    Control de Luces:
                  </span>
                  <div className="relative bg-gray-800 rounded-full p-1 shadow border border-gray-600">
                    <div className="flex gap-1">
                      <LightSwitchButton
                        active={lightMode === 0}
                        onClick={() => handleLightToggle(0)}
                        icon={<Moon className="w-4 h-4" />}
                        isMobile
                        color="bg-indigo-600"
                      />
                      <LightSwitchButton
                        active={lightMode === 2}
                        onClick={() => handleLightToggle(2)}
                        icon={<SunMoon className="w-4 h-4" />}
                        isMiddle
                        isMobile
                        color="bg-emerald-600"
                      />
                      <LightSwitchButton
                        active={lightMode === 1}
                        onClick={() => handleLightToggle(1)}
                        icon={<Sun className="w-4 h-4" />}
                        isMobile
                        color="bg-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowAccessModal(true);
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-all"
              >
                <KeyRound className="w-4 h-4" />
                Acceso Seguro
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Modal de acceso */}
      <AccessModal
        isOpen={showAccessModal}
        onClose={() => setShowAccessModal(false)}
        cliente={mqttInstance.getClient()}
      />

      {/* Configuración de notificaciones */}
      
    </>
  );
}

// Componentes auxiliares (LightSwitchButton, NavLink, MobileNavLink) permanecen iguales
function LightSwitchButton({
  active,
  onClick,
  icon,
  title,
  isMiddle,
  isMobile,
  color,
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`p-2 rounded-full flex items-center justify-center transition-all ${
        isMobile ? "w-8 h-8" : "px-4 py-2"
      } ${
        active
          ? `${color} text-white shadow-md`
          : "text-gray-300 hover:bg-gray-600"
      }`}
      title={title}
    >
      {icon}
    </motion.button>
  );
}

function NavLink({ to, icon, text, active }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
        active
          ? "bg-blue-600 text-white"
          : "text-gray-300 hover:bg-gray-700 hover:text-white"
      }`}
    >
      {icon}
      {text}
    </Link>
  );
}

function MobileNavLink({ to, icon, text, active, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition ${
        active
          ? "bg-blue-600 text-white"
          : "text-gray-300 hover:bg-gray-700 hover:text-white"
      }`}
    >
      {icon}
      {text}
    </Link>
  );
}