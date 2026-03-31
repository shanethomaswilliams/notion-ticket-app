import { useState, useRef, useCallback, useEffect } from "react";

const DEFAULT_TAGS = [
  { id: "t1", name: "Life Admin", color: "#6C63FF" },
  { id: "t2", name: "Work", color: "#FF6B6B" },
  { id: "t3", name: "Health", color: "#2ECC71" },
];

const DEFAULT_COLUMNS = [
  { id: "todo", title: "To Do", emoji: "📋" },
  { id: "inprogress", title: "In Progress", emoji: "⚡" },
  { id: "complete", title: "Complete", emoji: "✅" },
];

const PRESET_COLORS = [
  "#6C63FF", "#FF6B6B", "#2ECC71", "#F39C12", "#E91E63",
  "#00BCD4", "#9C27B0", "#FF5722", "#607D8B", "#795548",
  "#3F51B5", "#009688",
];

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function tagBg(hex, alpha = 0.12) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

function tagBorder(hex, alpha = 0.25) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

function CheckmarkAnimation({ onDone }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 50);
    const t2 = setTimeout(() => setPhase(2), 400);
    const t3 = setTimeout(() => { setPhase(3); onDone?.(); }, 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: phase >= 1 ? "rgba(46,204,113,0.08)" : "transparent",
      transition: "background 0.3s ease",
      pointerEvents: "none",
    }}>
      <div style={{
        width: 120, height: 120, borderRadius: "50%",
        background: phase >= 1 ? "linear-gradient(135deg, #2ECC71, #27AE60)" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        transform: phase >= 1 ? "scale(1)" : "scale(0.3)",
        opacity: phase >= 2 ? (phase === 3 ? 0 : 1) : (phase >= 1 ? 1 : 0),
        transition: phase >= 2 ? "opacity 0.5s ease" : "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease",
        boxShadow: phase >= 1 ? "0 8px 40px rgba(46,204,113,0.4)" : "none",
      }}>
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
          <path
            d="M14 28 L24 38 L42 18"
            stroke="white"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: 60,
              strokeDashoffset: phase >= 1 ? 0 : 60,
              transition: "stroke-dashoffset 0.4s ease 0.15s",
            }}
          />
        </svg>
      </div>
    </div>
  );
}

function TaskCard({ task, tags, onEdit, onDelete }) {
  const tag = tags.find((t) => t.id === task.tagId);
  const color = tag?.color || "#607D8B";

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", task.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      style={{
        background: "var(--card-bg)",
        borderRadius: 10,
        overflow: "hidden",
        cursor: "grab",
        transition: "box-shadow 0.2s, transform 0.2s",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.06)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{ height: 6, background: color }} />
      <div style={{ padding: "12px 14px", background: tagBg(color, 0.04) }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          {tag ? (
            <span style={{
              fontSize: 11, fontWeight: 600, letterSpacing: "0.02em",
              color: color, background: tagBg(color, 0.12),
              border: `1px solid ${tagBorder(color, 0.2)}`,
              padding: "2px 8px", borderRadius: 5, textTransform: "uppercase",
            }}>{tag.name}</span>
          ) : <span />}
          <div style={{ display: "flex", gap: 4, opacity: 0.3, transition: "opacity 0.15s" }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
            onMouseLeave={(e) => e.currentTarget.style.opacity = 0.3}
          >
            <button onClick={(e) => { e.stopPropagation(); onEdit(task); }} style={{
              background: "none", border: "none", cursor: "pointer", padding: 2,
              color: "var(--text-secondary)", fontSize: 13, lineHeight: 1,
            }}>✏️</button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} style={{
              background: "none", border: "none", cursor: "pointer", padding: 2,
              color: "var(--text-secondary)", fontSize: 13, lineHeight: 1,
            }}>🗑</button>
          </div>
        </div>
        <div style={{
          fontSize: 14, fontWeight: 600, color: "var(--text-primary)",
          marginBottom: task.description ? 4 : 0, lineHeight: 1.35,
          fontFamily: "'DM Sans', sans-serif",
        }}>{task.title}</div>
        {task.description && (
          <div style={{
            fontSize: 12.5, color: "var(--text-secondary)",
            lineHeight: 1.45, marginBottom: 6,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>{task.description}</div>
        )}
        {task.date && (
          <div style={{
            fontSize: 11, color: "var(--text-tertiary)",
            display: "flex", alignItems: "center", gap: 4, marginTop: 8,
          }}>
            <span>📅</span>
            {new Date(task.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </div>
        )}
      </div>
    </div>
  );
}

function Column({ column, tasks, tags, onDrop, onEditTask, onDeleteTask, onDeleteColumn, isDefault, dragOverCol, setDragOverCol }) {
  const isOver = dragOverCol === column.id;

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOverCol(column.id); }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setDragOverCol(null);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragOverCol(null);
        const taskId = e.dataTransfer.getData("text/plain");
        onDrop(taskId, column.id);
      }}
      style={{
        minWidth: 280, maxWidth: 320, flex: "1 0 280px",
        display: "flex", flexDirection: "column",
        background: isOver ? "var(--col-hover)" : "var(--col-bg)",
        borderRadius: 14, padding: 10,
        transition: "background 0.2s, box-shadow 0.2s",
        boxShadow: isOver ? "inset 0 0 0 2px var(--accent)" : "none",
        maxHeight: "calc(100vh - 140px)",
      }}
    >
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "6px 6px 10px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 16 }}>{column.emoji || "📁"}</span>
          <span style={{
            fontSize: 13, fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.06em", color: "var(--text-primary)",
            fontFamily: "'DM Sans', sans-serif",
          }}>{column.title}</span>
          <span style={{
            fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)",
            background: "var(--badge-bg)", borderRadius: 6, padding: "1px 7px", marginLeft: 2,
          }}>{tasks.length}</span>
        </div>
        {!isDefault && (
          <button onClick={() => onDeleteColumn(column.id)} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-tertiary)", fontSize: 16, padding: 2, lineHeight: 1,
            opacity: 0.5, transition: "opacity 0.15s",
          }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
            onMouseLeave={(e) => e.currentTarget.style.opacity = 0.5}
          >×</button>
        )}
      </div>
      <div style={{
        display: "flex", flexDirection: "column", gap: 8,
        overflowY: "auto", flex: 1, padding: "0 2px 2px",
      }}>
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} tags={tags} onEdit={onEditTask} onDelete={onDeleteTask} />
        ))}
        {tasks.length === 0 && (
          <div style={{
            padding: "32px 16px", textAlign: "center",
            color: "var(--text-tertiary)", fontSize: 13,
            border: isOver ? "none" : "2px dashed var(--border-dashed)",
            borderRadius: 10, lineHeight: 1.5,
          }}>
            {isOver ? "✨ Drop here!" : "Drag tasks here"}
          </div>
        )}
      </div>
    </div>
  );
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "var(--modal-bg)", borderRadius: 16,
        padding: "28px 28px 24px", width: "100%", maxWidth: 440,
        boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
        border: "1px solid var(--modal-border)",
        maxHeight: "90vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-primary)", fontFamily: "'DM Sans', sans-serif" }}>{title}</h3>
          <button onClick={onClose} style={{
            background: "none", border: "none", fontSize: 22,
            cursor: "pointer", color: "var(--text-tertiary)", lineHeight: 1,
          }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "10px 12px", borderRadius: 8,
  border: "1px solid var(--input-border)", background: "var(--input-bg)",
  color: "var(--text-primary)", fontSize: 14, outline: "none",
  fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box",
};

const btnPrimary = {
  padding: "10px 20px", borderRadius: 8, border: "none",
  background: "var(--accent)", color: "#fff", fontSize: 14, fontWeight: 600,
  cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
  transition: "opacity 0.15s",
  whiteSpace: "nowrap",
};

export default function TicketTracker() {
  const [tags, setTags] = useState(DEFAULT_TAGS);
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);
  const [tasks, setTasks] = useState([
    { id: "task1", title: "Renew passport", description: "Check expiry and submit renewal form online", date: "2026-04-15", tagId: "t1", columnId: "todo" },
    { id: "task2", title: "Q2 sprint planning", description: "Prepare capacity estimates for next quarter", date: "2026-04-02", tagId: "t2", columnId: "inprogress" },
    { id: "task3", title: "Book dentist appointment", description: "", date: "2026-04-10", tagId: "t3", columnId: "todo" },
  ]);

  const [showSettings, setShowSettings] = useState(false);
  const [showNewTask, setShowNewTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showCheckmark, setShowCheckmark] = useState(false);
  const [dragOverCol, setDragOverCol] = useState(null);

  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(PRESET_COLORS[0]);
  const [newColTitle, setNewColTitle] = useState("");
  const [newColEmoji, setNewColEmoji] = useState("📁");
  const [taskForm, setTaskForm] = useState({ title: "", description: "", date: "", tagId: "" });

  const idCounter = useRef(100);
  const genId = (prefix) => `${prefix}${++idCounter.current}`;

  const addTag = () => {
    if (!newTagName.trim()) return;
    setTags((p) => [...p, { id: genId("t"), name: newTagName.trim(), color: newTagColor }]);
    setNewTagName("");
    setNewTagColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
  };
  const removeTag = (id) => setTags((p) => p.filter((t) => t.id !== id));

  const addColumn = () => {
    if (!newColTitle.trim()) return;
    setColumns((p) => [...p, { id: genId("col"), title: newColTitle.trim(), emoji: newColEmoji || "📁" }]);
    setNewColTitle(""); setNewColEmoji("📁");
  };
  const deleteColumn = (id) => {
    setColumns((p) => p.filter((c) => c.id !== id));
    setTasks((p) => p.map((t) => t.columnId === id ? { ...t, columnId: "todo" } : t));
  };

  const openNewTask = () => {
    setTaskForm({ title: "", description: "", date: "", tagId: tags[0]?.id || "" });
    setEditingTask(null); setShowNewTask(true);
  };
  const openEditTask = (task) => {
    setTaskForm({ title: task.title, description: task.description, date: task.date, tagId: task.tagId });
    setEditingTask(task); setShowNewTask(true);
  };
  const saveTask = () => {
    if (!taskForm.title.trim()) return;
    if (editingTask) {
      setTasks((p) => p.map((t) => t.id === editingTask.id ? { ...t, ...taskForm, title: taskForm.title.trim() } : t));
    } else {
      setTasks((p) => [...p, { id: genId("task"), ...taskForm, title: taskForm.title.trim(), columnId: "todo" }]);
    }
    setShowNewTask(false); setEditingTask(null);
  };
  const deleteTask = (id) => setTasks((p) => p.filter((t) => t.id !== id));

  const handleDrop = useCallback((taskId, targetColId) => {
    setTasks((prev) => {
      const task = prev.find((t) => t.id === taskId);
      if (!task || task.columnId === targetColId) return prev;
      const wasNotComplete = task.columnId !== "complete";
      if (targetColId === "complete" && wasNotComplete) {
        setTimeout(() => setShowCheckmark(true), 50);
      }
      return prev.map((t) => t.id === taskId ? { ...t, columnId: targetColId } : t);
    });
  }, []);

  const checkmarkDone = useCallback(() => setShowCheckmark(false), []);

  return (
    <div style={{
      minHeight: "100vh", background: "var(--page-bg)",
      fontFamily: "'DM Sans', sans-serif", color: "var(--text-primary)",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');
        :root {
          --page-bg: #F7F6F3;
          --col-bg: #EFEDEA;
          --col-hover: #E8E5E0;
          --card-bg: #FFFFFF;
          --modal-bg: #FFFFFF;
          --modal-border: rgba(0,0,0,0.08);
          --input-bg: #F7F6F3;
          --input-border: #D8D5CF;
          --text-primary: #1A1A1A;
          --text-secondary: #5A5A5A;
          --text-tertiary: #9A9A9A;
          --border-dashed: #D0CEC8;
          --badge-bg: rgba(0,0,0,0.06);
          --accent: #6C63FF;
          --topbar-bg: #FFFFFF;
          --topbar-border: rgba(0,0,0,0.06);
        }
        * { box-sizing: border-box; margin: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 10px; }
      `}</style>

      {showCheckmark && <CheckmarkAnimation onDone={checkmarkDone} />}

      {/* Top bar */}
      <div style={{
        background: "var(--topbar-bg)", borderBottom: "1px solid var(--topbar-border)",
        padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 26 }}>🎯</span>
          <h1 style={{
            fontSize: 22, fontWeight: 700, fontFamily: "'Playfair Display', serif",
            color: "var(--text-primary)", letterSpacing: "-0.01em",
          }}>Ticket Tracker</h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={openNewTask} style={{ ...btnPrimary, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> New Task
          </button>
          <button onClick={() => setShowSettings(true)} style={{
            padding: "10px 16px", borderRadius: 8, border: "1px solid var(--input-border)",
            background: "var(--card-bg)", color: "var(--text-primary)",
            fontSize: 14, fontWeight: 500, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 6,
          }}>
            ⚙️ Settings
          </button>
        </div>
      </div>

      {/* Board */}
      <div style={{
        display: "flex", gap: 14, padding: "20px 24px",
        overflowX: "auto", alignItems: "flex-start", minHeight: "calc(100vh - 70px)",
      }}>
        {columns.map((col) => (
          <Column
            key={col.id} column={col}
            tasks={tasks.filter((t) => t.columnId === col.id)}
            tags={tags} onDrop={handleDrop} onEditTask={openEditTask}
            onDeleteTask={deleteTask} onDeleteColumn={deleteColumn}
            isDefault={["todo", "inprogress", "complete"].includes(col.id)}
            dragOverCol={dragOverCol} setDragOverCol={setDragOverCol}
          />
        ))}
        <button onClick={() => setShowSettings(true)} style={{
          minWidth: 180, height: 80, borderRadius: 14,
          border: "2px dashed var(--border-dashed)", background: "transparent",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          gap: 8, color: "var(--text-tertiary)", fontSize: 14, fontWeight: 500,
          fontFamily: "'DM Sans', sans-serif", flexShrink: 0,
          transition: "border-color 0.15s, color 0.15s",
        }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-dashed)"; e.currentTarget.style.color = "var(--text-tertiary)"; }}
        >+ Add Column</button>
      </div>

      {/* Settings */}
      <Modal open={showSettings} onClose={() => setShowSettings(false)} title="⚙️ Settings">
        <div style={{ marginBottom: 24 }}>
          <h4 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>🏷️ Tags</h4>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
            {tags.map((tag) => (
              <span key={tag.id} style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "5px 10px", borderRadius: 6, fontSize: 13, fontWeight: 600,
                color: tag.color, background: tagBg(tag.color),
                border: `1px solid ${tagBorder(tag.color)}`,
              }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: tag.color, flexShrink: 0 }} />
                {tag.name}
                <button onClick={() => removeTag(tag.id)} style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: tag.color, fontSize: 14, padding: 0, lineHeight: 1,
                }}>×</button>
              </span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input value={newTagName} onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTag()}
              placeholder="Tag name…" style={{ ...inputStyle, flex: 1 }} />
            <div style={{
              width: 38, height: 38, borderRadius: 8, background: newTagColor,
              cursor: "pointer", border: "2px solid var(--input-border)", position: "relative", flexShrink: 0,
            }}>
              <input type="color" value={newTagColor} onChange={(e) => setNewTagColor(e.target.value)}
                style={{ position: "absolute", inset: 0, opacity: 0, width: "100%", height: "100%", cursor: "pointer" }} />
            </div>
            <button onClick={addTag} style={btnPrimary}>Add</button>
          </div>
          <div style={{ display: "flex", gap: 5, marginTop: 8, flexWrap: "wrap" }}>
            {PRESET_COLORS.map((c) => (
              <button key={c} onClick={() => setNewTagColor(c)} style={{
                width: 22, height: 22, borderRadius: 6,
                border: newTagColor === c ? "2px solid var(--text-primary)" : "2px solid transparent",
                background: c, cursor: "pointer", padding: 0, transition: "transform 0.1s",
              }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.15)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              />
            ))}
          </div>
        </div>

        <div>
          <h4 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>📊 Columns</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
            {columns.map((col) => (
              <div key={col.id} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "8px 12px", background: "var(--input-bg)", borderRadius: 8,
              }}>
                <span>{col.emoji}</span>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{col.title}</span>
                {["todo", "inprogress", "complete"].includes(col.id) ? (
                  <span style={{ fontSize: 11, color: "var(--text-tertiary)", fontStyle: "italic" }}>default</span>
                ) : (
                  <button onClick={() => deleteColumn(col.id)} style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "#FF6B6B", fontSize: 13, fontWeight: 600,
                  }}>Remove</button>
                )}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={newColEmoji} onChange={(e) => setNewColEmoji(e.target.value)}
              style={{ ...inputStyle, width: 48, textAlign: "center", padding: "10px 4px" }} maxLength={2} />
            <input value={newColTitle} onChange={(e) => setNewColTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addColumn()}
              placeholder="Column name…" style={{ ...inputStyle, flex: 1 }} />
            <button onClick={addColumn} style={btnPrimary}>Add</button>
          </div>
        </div>
      </Modal>

      {/* New / Edit Task */}
      <Modal open={showNewTask} onClose={() => { setShowNewTask(false); setEditingTask(null); }} title={editingTask ? "✏️ Edit Task" : "✨ New Task"}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>Title *</label>
            <input value={taskForm.title} onChange={(e) => setTaskForm((f) => ({ ...f, title: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && saveTask()}
              placeholder="What needs to be done?" style={inputStyle} autoFocus />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>Description</label>
            <textarea value={taskForm.description} onChange={(e) => setTaskForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Add some details…" rows={3}
              style={{ ...inputStyle, resize: "vertical", minHeight: 70 }} />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>Date</label>
              <input type="date" value={taskForm.date} onChange={(e) => setTaskForm((f) => ({ ...f, date: e.target.value }))} style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>Tag</label>
              <select value={taskForm.tagId} onChange={(e) => setTaskForm((f) => ({ ...f, tagId: e.target.value }))}
                style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="">No tag</option>
                {tags.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <button onClick={saveTask} style={{ ...btnPrimary, width: "100%", marginTop: 4, padding: "12px 20px" }}>
            {editingTask ? "Save Changes" : "Add to To Do →"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
