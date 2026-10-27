import "./App.css";
import { Editor } from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";
import { useRef, useMemo, useState, useEffect } from "react";
import * as Y from "yjs";
import { SocketIOProvider } from "y-socket.io";

const AVATAR_COLORS = [
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
];

function Avatar({ name, color }) {
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
      style={{ backgroundColor: color }}
      title={name}
    >
      {name[0].toUpperCase()}
    </div>
  );
}

function App() {
  const editorRef = useRef(null);
  const [username, setUsername] = useState(
    () => new URLSearchParams(window.location.search).get("username") || "",
  );
  const [users, setUsers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const ydoc = useMemo(() => new Y.Doc(), []);
  const yText = useMemo(() => ydoc.getText("monaco"), [ydoc]);

  const handleMount = (editor) => {
    editorRef.current = editor;
    new MonacoBinding(
      yText,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
    );
  };

  useEffect(() => {
    if (!username) return;
    const provider = new SocketIOProvider(
      "/",
      "monaco",
      ydoc,
      { autoConnect: true },
    );
    provider.awareness.setLocalStateField("user", { username });
    const updateUsers = () => {
      const states = Array.from(provider.awareness.getStates().values());
      setUsers(states.filter((s) => s?.user?.username).map((s) => s.user));
    };
    provider.awareness.on("change", updateUsers);
    const handleBeforeUnload = () =>
      provider.awareness.setLocalStateField("user", null);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      provider.awareness.off("change", updateUsers);
      provider.disconnect();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [username, ydoc]);

  const handleJoin = (e) => {
    e.preventDefault();
    const val = e.target.username.value.trim();
    if (!val) return;
    setUsername(val);
    window.history.pushState({}, "", "?username=" + val);
  };

  if (!username) {
    return (
      <main className="min-h-screen w-full bg-gray-950 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-gray-950"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 14.094A5.973 5.973 0 004 17v1H1v-1a3 3 0 013.75-2.906z" />
              </svg>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">
                CollabCode
              </h1>
              <p className="text-gray-500 text-xs">
                Real-time collaborative editor
              </p>
            </div>
          </div>
          <form onSubmit={handleJoin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-400 text-sm font-medium">
                Username
              </label>
              <input
                type="text"
                placeholder="Enter your username"
                className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                name="username"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-gray-950 font-semibold transition-all duration-150 hover:shadow-lg hover:shadow-amber-500/20"
            >
              Join Session
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen w-full bg-gray-950 flex flex-col text-white overflow-hidden">
      {/* Mobile top bar */}
      <header className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800 md:hidden shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-gray-950"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <span className="font-semibold text-white">CollabCode</span>
        </div>
        <button
          onClick={() => setSidebarOpen((o) => !o)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm transition-colors"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          {users.length} online
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-10 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={[
            "fixed md:relative z-20 md:z-auto",
            "h-full w-72 md:w-64 lg:w-72",
            "bg-gray-900 border-r border-gray-800",
            "flex flex-col",
            "transition-transform duration-300 ease-in-out",
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0",
          ].join(" ")}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 shrink-0">
            <div className="hidden md:flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-gray-950"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="font-bold text-white">CollabCode</span>
            </div>
            <span className="md:hidden font-bold text-white">
              Collaborators
            </span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="px-5 py-3 border-b border-gray-800 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                {users.length} online
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3">
            <ul className="flex flex-col gap-1">
              {users.map((user, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  <Avatar
                    name={user.username}
                    color={AVATAR_COLORS[index % AVATAR_COLORS.length]}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {user.username}
                    </p>
                    {user.username === username && (
                      <p className="text-xs text-amber-500">You</p>
                    )}
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                </li>
              ))}
            </ul>
          </div>

          <div className="px-4 py-4 border-t border-gray-800 shrink-0">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-800">
              <Avatar name={username} color={AVATAR_COLORS[0]} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {username}
                </p>
                <p className="text-xs text-gray-500">Active session</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Editor */}
        <section className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-gray-900 border-b border-gray-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
              </div>
              <span className="text-gray-500 text-sm">main.js</span>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-md bg-gray-800 text-amber-400 font-mono border border-gray-700">
              JavaScript
            </span>
          </div>

          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              defaultValue="// Start collaborating..."
              theme="vs-dark"
              onMount={handleMount}
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                minimap: { enabled: false },
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: "smooth",
                renderLineHighlight: "gutter",
              }}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;
