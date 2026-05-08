# OpenShift SRE Simulator

An interactive web-based game that teaches **Site Reliability Engineering (SRE)** concepts through hands-on cluster management simulation. Manage pods, handle failures, scale your infrastructure, and maintain uptime while learning real OpenShift operations.

## 🎮 Game Overview

In the OpenShift SRE Simulator, you take on the role of a Site Reliability Engineer managing a Kubernetes cluster. Your mission is to:

- **Monitor** pod health and resource utilization (CPU, Memory)
- **Respond** to pod failures and restart crashed services
- **Scale** your cluster to handle increasing load
- **Maintain** uptime while managing incidents
- **Earn points** for successful management and incident prevention

### Game Mechanics

- **Pods**: Each pod represents a microservice running in your cluster. They can be in states: Running, Pending, Crashed, or Evicted
- **Resource Usage**: CPU and Memory metrics fluctuate realistically, simulating production workloads
- **Failures**: Random pod failures occur to simulate real-world chaos and test your response time
- **Incidents**: When cluster resources are exhausted, incidents are recorded. Too many incidents = Game Over
- **Scoring**: Earn points for keeping pods healthy, scaling the cluster, and maintaining uptime

## 🚀 Quick Start

### Prerequisites

- Node.js 22+ and pnpm
- Docker/Podman for containerization
- OpenShift 4.x cluster (for deployment)
- `oc` CLI tool (for OpenShift operations)

### Local Development

```bash
# Clone the repository
git clone https://github.com/your-org/openshift-sre-simulator.git
cd openshift-sre-simulator

# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Open browser at http://localhost:3000
```

### Build for Production

```bash
# Build the application
pnpm run build

# Start production server
pnpm start
```

## 🐳 Containerization

### Build Docker Image

```bash
# Build the image
docker build -t sre-simulator:latest .

# Run locally
docker run -p 3000:3000 sre-simulator:latest
```

### Push to Registry

```bash
# Tag for registry
docker tag sre-simulator:latest quay.io/your-org/sre-simulator:latest

# Push
docker push quay.io/your-org/sre-simulator:latest
```

## 📦 Deployment

### OpenShift Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for comprehensive deployment instructions.

**Quick Deploy:**

```bash
# Apply deployment manifests
oc apply -f openshift-deployment.yaml

# Check status
oc get pods -n sre-simulator
oc get route -n sre-simulator

# Access the application
oc get route sre-simulator -n sre-simulator -o jsonpath='{.spec.host}'
```

### CI/CD Pipeline

The project includes a **Tekton Pipeline** for automated build and deployment:

```bash
# Deploy the pipeline
oc apply -f tekton-pipeline.yaml

# Trigger manually or via GitHub webhook
oc create -f - <<EOF
apiVersion: tekton.dev/v1beta1
kind: PipelineRun
metadata:
  generateName: sre-simulator-run-
  namespace: sre-simulator
spec:
  pipelineRef:
    name: sre-simulator-pipeline
  workspaces:
  - name: shared-workspace
    volumeClaimTemplate:
      spec:
        accessModes:
        - ReadWriteOnce
        resources:
          requests:
            storage: 1Gi
EOF
```

## 🏗️ Architecture

### Technology Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Backend**: Express.js (static file serving)
- **Container**: Docker/Podman
- **Orchestration**: OpenShift/Kubernetes
- **CI/CD**: Tekton Pipelines

### Project Structure

```
openshift_sre_simulator/
├── client/                      # Frontend React application
│   ├── src/
│   │   ├── pages/              # Page components
│   │   │   └── Home.tsx        # Main game component
│   │   ├── components/         # Reusable UI components
│   │   ├── contexts/           # React contexts
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # Utility functions
│   │   ├── App.tsx             # Main app component
│   │   ├── main.tsx            # React entry point
│   │   └── index.css           # Global styles
│   ├── public/                 # Static assets
│   └── index.html              # HTML template
├── server/                      # Backend Express server
│   └── index.ts                # Server entry point
├── Dockerfile                  # Container image definition
├── openshift-deployment.yaml   # OpenShift manifests
├── tekton-pipeline.yaml        # CI/CD pipeline definition
├── DEPLOYMENT_GUIDE.md         # Detailed deployment guide
├── package.json                # Dependencies
└── README.md                   # This file
```

## 🎯 Game Features

### Pod Management

- **Real-time Monitoring**: View CPU and memory usage for each pod
- **Status Indicators**: Visual indicators for pod health (Running, Pending, Crashed, Evicted)
- **Restart Capability**: Click to restart failed pods and earn points
- **Restart History**: Track pod restart counts

### Cluster Operations

- **Scaling**: Add new pods to handle increased load
- **Resource Tracking**: Monitor total cluster CPU and memory utilization
- **Incident Tracking**: Track the number of incidents and cluster health
- **Uptime Counter**: Measure how long you keep the cluster stable

### Scoring System

- **Base Points**: Earn points for every second of uptime
- **Restart Bonus**: +50 points for each successful pod restart
- **Scaling Bonus**: +100 points for adding new pods
- **Incident Penalty**: Game Over if incidents exceed threshold

## 🔧 Configuration

### Environment Variables

Configure the application via environment variables:

```bash
NODE_ENV=production    # Environment mode
PORT=3000             # Server port
LOG_LEVEL=info        # Logging level
```

### Resource Limits

Edit `openshift-deployment.yaml` to adjust:

```yaml
resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 512Mi
```

## 📊 Monitoring

### Health Checks

The deployment includes:

- **Liveness Probe**: Restarts unhealthy pods
- **Readiness Probe**: Removes pods from load balancing if not ready

### Metrics

Access application metrics at `/metrics` (if configured with Prometheus).

### Logs

View application logs:

```bash
# Real-time logs
oc logs -f deployment/sre-simulator -n sre-simulator

# Specific pod logs
oc logs <pod-name> -n sre-simulator
```

## 🔐 Security

The deployment implements security best practices:

- **Non-root User**: Runs as UID 1001
- **Read-only Filesystem**: Restricted filesystem access
- **Capability Dropping**: Removes unnecessary Linux capabilities
- **Network Policies**: Can be configured for pod-to-pod communication
- **RBAC**: Minimal service account permissions
- **TLS**: HTTPS via OpenShift Route

## 🚦 Troubleshooting

### Pod Not Starting

```bash
# Check pod events
oc describe pod <pod-name> -n sre-simulator

# Check logs
oc logs <pod-name> -n sre-simulator
```

### Application Not Accessible

```bash
# Verify service
oc get svc sre-simulator -n sre-simulator

# Verify route
oc get route sre-simulator -n sre-simulator

# Test connectivity
oc port-forward svc/sre-simulator 3000:80 -n sre-simulator
curl http://localhost:3000
```

### Build Failures

```bash
# Check build logs
oc logs -f bc/sre-simulator -n sre-simulator
```

For more troubleshooting, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).

## 📚 Learning Outcomes

By playing the OpenShift SRE Simulator, you'll learn:

- **Kubernetes Concepts**: Pods, Deployments, Services, Routes
- **SRE Principles**: Incident management, uptime tracking, resource optimization
- **Cluster Management**: Monitoring, scaling, and troubleshooting
- **OpenShift Specifics**: Routes vs Ingress, DeploymentConfigs, Security Context Constraints
- **Production Operations**: Real-world challenges in managing containerized applications

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Resources

- **OpenShift Documentation**: https://docs.openshift.com/
- **Kubernetes Documentation**: https://kubernetes.io/docs/
- **Tekton Documentation**: https://tekton.dev/docs/
- **SRE Book**: https://sre.google/books/
- **Container Best Practices**: https://docs.openshift.com/container-platform/latest/openshift_images/

## 📧 Support

For issues, questions, or suggestions:

- Open an issue on GitHub
- Check the [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions
- Review the troubleshooting section above

---

**Happy SRE-ing! 🚀**

Transform yourself into a Site Reliability Engineer by mastering cluster management in the OpenShift SRE Simulator!
