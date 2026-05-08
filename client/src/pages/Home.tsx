import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, AlertTriangle, Zap, RotateCw, Pause, Play } from "lucide-react";

interface Pod {
  id: string;
  name: string;
  status: "running" | "pending" | "crashed" | "evicted";
  cpu: number;
  memory: number;
  restarts: number;
}

interface ClusterMetrics {
  totalCPU: number;
  totalMemory: number;
  uptime: number;
  incidents: number;
}

export default function Home() {
  const [pods, setPods] = useState<Pod[]>([
    { id: "1", name: "api-server-1", status: "running", cpu: 45, memory: 60, restarts: 0 },
    { id: "2", name: "api-server-2", status: "running", cpu: 52, memory: 55, restarts: 0 },
    { id: "3", name: "database-1", status: "running", cpu: 78, memory: 85, restarts: 1 },
    { id: "4", name: "cache-1", status: "running", cpu: 30, memory: 40, restarts: 0 },
    { id: "5", name: "worker-1", status: "running", cpu: 65, memory: 70, restarts: 0 },
  ]);

  const [metrics, setMetrics] = useState<ClusterMetrics>({
    totalCPU: 0,
    totalMemory: 0,
    uptime: 0,
    incidents: 0,
  });

  const [gameRunning, setGameRunning] = useState(true);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Simulate cluster chaos
  useEffect(() => {
    if (!gameRunning || gameOver) return;

    const interval = setInterval(() => {
      setPods((prevPods) => {
        let newPods = prevPods.map((pod) => {
          let newPod = { ...pod };

          // Random pod failures
          if (Math.random() < 0.15) {
            const statuses: ("running" | "pending" | "crashed" | "evicted")[] = [
              "crashed",
              "pending",
              "evicted",
            ];
            newPod.status = statuses[Math.floor(Math.random() * statuses.length)];
            newPod.restarts += 1;
          }

          // Resource fluctuation
          newPod.cpu = Math.max(10, Math.min(100, newPod.cpu + (Math.random() - 0.5) * 20));
          newPod.memory = Math.max(10, Math.min(100, newPod.memory + (Math.random() - 0.5) * 20));

          return newPod;
        });

        // Check for cluster overload
        const avgCPU = newPods.reduce((sum, p) => sum + p.cpu, 0) / newPods.length;
        const avgMemory = newPods.reduce((sum, p) => sum + p.memory, 0) / newPods.length;

        if (avgCPU > 90 || avgMemory > 90) {
          setMetrics((prev) => ({ ...prev, incidents: prev.incidents + 1 }));
          if (metrics.incidents > 5) {
            setGameOver(true);
          }
        }

        return newPods;
      });

      setMetrics((prev) => ({
        ...prev,
        uptime: prev.uptime + 1,
        totalCPU: Math.round(pods.reduce((sum, p) => sum + p.cpu, 0) / pods.length),
        totalMemory: Math.round(pods.reduce((sum, p) => sum + p.memory, 0) / pods.length),
      }));

      setScore((prev) => prev + 10);
    }, 2000);

    return () => clearInterval(interval);
  }, [gameRunning, gameOver, metrics.incidents, pods]);

  const restartPod = (podId: string) => {
    setPods((prevPods) =>
      prevPods.map((pod) =>
        pod.id === podId
          ? { ...pod, status: "running", cpu: 30, memory: 40, restarts: pod.restarts + 1 }
          : pod
      )
    );
    setScore((prev) => prev + 50);
  };

  const scaleCluster = () => {
    const newPod: Pod = {
      id: String(pods.length + 1),
      name: `worker-${pods.length + 1}`,
      status: "running",
      cpu: 40,
      memory: 50,
      restarts: 0,
    };
    setPods((prev) => [...prev, newPod]);
    setScore((prev) => prev + 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "crashed":
        return "bg-red-100 text-red-800";
      case "evicted":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <CheckCircle2 className="w-4 h-4" />;
      case "pending":
        return <AlertTriangle className="w-4 h-4" />;
      case "crashed":
        return <AlertCircle className="w-4 h-4" />;
      case "evicted":
        return <Zap className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">OpenShift SRE Simulator</h1>
          <p className="text-slate-300">Manage your cluster, fix failures, and keep the platform alive!</p>
        </div>

        {/* Game Over Screen */}
        {gameOver && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <Card className="bg-white p-8 rounded-lg shadow-2xl max-w-md">
              <div className="text-center">
                <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Game Over!</h2>
                <p className="text-gray-600 mb-4">Too many incidents. The cluster went down.</p>
                <p className="text-xl font-bold text-blue-600 mb-6">Final Score: {score}</p>
                <Button
                  onClick={() => {
                    setGameOver(false);
                    setScore(0);
                    setMetrics({ totalCPU: 0, totalMemory: 0, uptime: 0, incidents: 0 });
                    setPods([
                      { id: "1", name: "api-server-1", status: "running", cpu: 45, memory: 60, restarts: 0 },
                      { id: "2", name: "api-server-2", status: "running", cpu: 52, memory: 55, restarts: 0 },
                      { id: "3", name: "database-1", status: "running", cpu: 78, memory: 85, restarts: 1 },
                      { id: "4", name: "cache-1", status: "running", cpu: 30, memory: 40, restarts: 0 },
                      { id: "5", name: "worker-1", status: "running", cpu: 65, memory: 70, restarts: 0 },
                    ]);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Restart Game
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="text-slate-400 text-sm font-medium mb-2">Score</div>
            <div className="text-3xl font-bold text-green-400">{score}</div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="text-slate-400 text-sm font-medium mb-2">Uptime (s)</div>
            <div className="text-3xl font-bold text-blue-400">{metrics.uptime}</div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="text-slate-400 text-sm font-medium mb-2">Incidents</div>
            <div className="text-3xl font-bold text-red-400">{metrics.incidents}</div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="text-slate-400 text-sm font-medium mb-2">Pods Running</div>
            <div className="text-3xl font-bold text-purple-400">
              {pods.filter((p) => p.status === "running").length}/{pods.length}
            </div>
          </Card>
        </div>

        {/* Control Panel */}
        <div className="flex gap-4 mb-8">
          <Button
            onClick={() => setGameRunning(!gameRunning)}
            className={`flex items-center gap-2 ${
              gameRunning ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {gameRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {gameRunning ? "Pause" : "Resume"}
          </Button>
          <Button onClick={scaleCluster} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Scale Cluster (+100 pts)
          </Button>
        </div>

        {/* Pods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pods.map((pod) => (
            <Card key={pod.id} className="bg-slate-800 border-slate-700 p-6 hover:border-slate-600 transition">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">{pod.name}</h3>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(pod.status)}`}>
                  {getStatusIcon(pod.status)}
                  {pod.status.charAt(0).toUpperCase() + pod.status.slice(1)}
                </div>
              </div>

              {/* Resource Usage */}
              <div className="space-y-3 mb-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">CPU Usage</span>
                    <span className="text-slate-200 font-medium">{Math.round(pod.cpu)}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        pod.cpu > 80 ? "bg-red-500" : pod.cpu > 60 ? "bg-yellow-500" : "bg-green-500"
                      }`}
                      style={{ width: `${pod.cpu}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Memory Usage</span>
                    <span className="text-slate-200 font-medium">{Math.round(pod.memory)}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        pod.memory > 80 ? "bg-red-500" : pod.memory > 60 ? "bg-yellow-500" : "bg-green-500"
                      }`}
                      style={{ width: `${pod.memory}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Pod Info */}
              <div className="flex justify-between text-sm text-slate-400 mb-4 pb-4 border-b border-slate-700">
                <span>Restarts: {pod.restarts}</span>
              </div>

              {/* Action Button */}
              <Button
                onClick={() => restartPod(pod.id)}
                disabled={pod.status === "running"}
                className={`w-full flex items-center justify-center gap-2 ${
                  pod.status === "running"
                    ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                <RotateCw className="w-4 h-4" />
                {pod.status === "running" ? "Healthy" : "Restart Pod (+50 pts)"}
              </Button>
            </Card>
          ))}
        </div>

        {/* Instructions */}
        <Card className="bg-slate-800 border-slate-700 p-6 mt-8">
          <h3 className="text-lg font-semibold text-white mb-4">How to Play</h3>
          <ul className="space-y-2 text-slate-300 text-sm">
            <li>• Monitor your pods and their resource usage (CPU & Memory)</li>
            <li>• Click "Restart Pod" to fix crashed or evicted pods (+50 points)</li>
            <li>• Scale your cluster when needed to handle load (+100 points)</li>
            <li>• Keep incidents below 6 to avoid cluster failure</li>
            <li>• Earn points for uptime and successful pod management</li>
            <li>• Game Over when too many incidents occur</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
