import React, { useEffect } from "react";
import api from "../utils/base_url";
import { useNavigate } from "react-router-dom";

const NotificationPanel = ({
    isOpen,
    onClose,
    user,
    notifications,
    setNotifications,
    unreadCount,
    setUnreadCount,
    openFeedbackModal
}) => {

    const [activeSwipeId, setActiveSwipeId] = React.useState(null);
    const [swipedId, setSwipedId] = React.useState(null);
    const touchStartX = React.useRef(0);
    const touchEndX = React.useRef(0);

    const handleTouchStart = (e, id) => {
        touchStartX.current = e.changedTouches[0].clientX;
    };

    const handleTouchEnd = (e, id) => {
        touchEndX.current = e.changedTouches[0].clientX;
        const diff = touchStartX.current - touchEndX.current;

        if (diff > 40) {
            setSwipedId(id);        // swipe left → open
        }
        else if (diff < -40) {
            setSwipedId(null);      // swipe right → close
        }
    };


    const navigate = useNavigate();

    useEffect(() => {
        if (!isOpen) return;

        if (unreadCount > 0) {
            api.put(`readnotifications/all/${user.customer_details.id}/`)
                .then(() => {
                    setUnreadCount(0);
                    setNotifications(prev =>
                        prev.map(n => ({ ...n, is_read: true }))
                    );
                })
                .catch(err => console.error(err));
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);



    // BELL CLICK → Mark all as read
    useEffect(() => {
        if (!isOpen) return;  // only run when panel opens

        if (unreadCount > 0) {
            api.put(`readnotifications/all/${user.customer_details.id}/`)
                .then(() => setUnreadCount(0))
                .catch(err => console.error(err));
        }

    }, [isOpen, unreadCount, user.customer_details.id, setUnreadCount]);


    // Delete single
    const deleteNotification = async (id) => {
        try {
            await api.delete(`notification/${id}/`);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    // Clear all
    const clearAll = async () => {
        try {
            await api.delete(`notifications/clear/${user.customer_details.id}/`);
            setNotifications([]);
            setUnreadCount(0);
            onClose();
        } catch (err) {
            console.error("Clear all error:", err);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="notif-backdrop" onClick={onClose}></div>

            <div className="notif-panel">

                <div className="notif-header">
                    <h6>Notifications</h6>

                    {notifications.length > 0 && (
                        <button className="clear-btn" onClick={clearAll}>
                            Clear All
                        </button>
                    )}
                </div>

                <div className="notif-body">
                    {notifications.length === 0 ? (
                        <p className="text-center text-muted mt-3">No notifications</p>
                    ) : (
                        notifications.map((n) => (
                            <div
                                key={n.id}
                                className="notif-item swipe-container"
                                onTouchStart={(e) => handleTouchStart(e, n.id)}
                                onTouchEnd={(e) => handleTouchEnd(e, n.id)}
                            >


                                {/* CONTENT */}
                                <div
                                    className={`notif-content ${swipedId === n.id ? "show-delete" : ""}`}
                                    onClick={async () => {
                                        try {
                                            await api.put(`readnotifications/${n.id}/`);

                                            setNotifications(prev =>
                                                prev.map(x =>
                                                    x.id === n.id ? { ...x, is_read: true } : x
                                                )
                                            );

                                            if (!n.is_read) setUnreadCount(c => c - 1);

                                        } catch (err) {
                                            console.error(err);
                                        }

                                        if (n.type === "order_status") {
                                            navigate(`/order-tracking/${n.order_number}`);
                                        } else if (n.type === "product_rating") {
                                            openFeedbackModal({ id: n.product_id, product_name: n.product_name });
                                        }

                                        onClose();
                                    }}
                                    onTouchStart={() => setActiveSwipeId(n.id)}
                                >
                                    <strong>{n.title}</strong>
                                    <p>{n.message}</p>
                                    <span className="notif-time">
                                        {new Date(n.created_at).toLocaleString()}
                                    </span>
                                </div>

                                {/* DELETE ICON */}
                                <div
                                    className="notif-delete-btn"
                                    onClick={() => deleteNotification(n.id)}
                                >
                                    <i className="fa fa-trash"></i>
                                </div>

                            </div>
                        ))
                    )}
                </div>

            </div>
            <style>{
                `
              /* Ensure container clips the delete area */
.swipe-container {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: #fffaf4;
  margin: 0;        /* remove spacing */
  padding: 0;       /* remove spacing */
  border-bottom: 1px solid #e6d2b5;
}

/* Content always covers delete panel */
.notif-content {
  width: 100%;
  padding: 14px;
  background: #fffaf4;
  position: relative;
  z-index: 2;
  transition: transform 0.25s ease-in-out;
  box-sizing: border-box;
}

/* Delete button stays behind content */
.notif-delete-btn {
  position: absolute;
  top: 0;
  right: 0;
  width: 70px;
  height: 100%;
  background: #dc3545;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1; /* behind content */
}

/* Only slide when hover */
/* Desktop hover */
@media (hover: hover) and (pointer: fine) {
  .swipe-container:hover .notif-content {
    transform: translateX(-70px);
  }
}

/* Mobile swipe */
.notif-content.show-delete {
  transform: translateX(-70px);
}

.notif-content {
  transition: transform 0.25s ease-in-out;
}


/* Mobile tap/swipe */
.notif-content.swiped {
  transform: translateX(-70px);
}


/* Panel layout remains same */
.notif-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 2000;
}

.notif-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 320px;
  height: 100vh;
  background: #fffaf4;
  border-left: 2px solid #e6d2b5;
  z-index: 2100;
  animation: slideInRight 0.3s ease forwards;
  display: flex;
  flex-direction: column;
}

@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.notif-header {
  padding: 15px;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #e6d2b5;
}

.clear-btn {
  border: none;
  background: #b33a3a;
  color: white;
  padding: 5px 10px;
  border-radius: 6px;
}

.notif-body {
  overflow-y: auto;
  height: calc(100vh - 70px);
}

.notif-time {
  color: #777;
  font-size: 0.75rem;
}

                `}
            </style>
        </>
    );
};

export default NotificationPanel;
