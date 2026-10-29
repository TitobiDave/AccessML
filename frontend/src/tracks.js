// status: 'done' | 'current' | 'todo'
// icon: a key from ICONS in Roadmap.jsx
// go: page the tile opens
// lessonId: id of the lesson in the backend (GET /api/lessons/{id}); a lesson tile without one shows "Coming soon"
export const TRACKS = [
  { id: 'python', name: 'Python & NumPy', steps: [
    { title: 'Python basics', text: 'Variables, loops, functions and reading error messages.', icon: 'Terminal', go: 'lessons', lessonId: 1 },
    { title: 'NumPy arrays', text: 'Vectors, matrices, shapes and broadcasting.', icon: 'Grid3x3', go: 'lessons' },
    { title: 'Data wrangling', text: 'Load, clean and slice datasets with pandas.', icon: 'Table2', go: 'lessons' },
    { title: 'Visualize data', text: 'Plot distributions and relationships between features.', icon: 'BarChart3', go: 'lessons' },
    { title: 'Checkpoint quiz', text: 'Prove you can move data around without a loop.', icon: 'ListChecks', go: 'quizzes' },
  ]},
  { id: 'supervised', name: 'Supervised Learning', steps: [
    { title: 'Features & labels', text: 'Frame a problem as inputs, targets and a hypothesis function.', icon: 'Tags', go: 'lessons' },
    { title: 'Linear regression', text: 'Fit a line with weights and a bias term.', icon: 'TrendingUp', go: 'lessons' },
    { title: 'Cost & gradient descent', text: 'Minimize mean squared error one step at a time.', icon: 'TrendingDown', go: 'lessons' },
    { title: 'Classification', text: 'Logistic regression, cross-entropy and decision boundaries.', icon: 'Split', go: 'lessons' },
    { title: 'Evaluate models', text: 'Train/test splits, overfitting and metrics.', icon: 'Gauge', go: 'quizzes' },
    { title: 'Get certified', text: 'Finish every lab and claim your certificate.', icon: 'Award', go: 'certificate' },
  ]},
  { id: 'deep', name: 'Deep Learning', steps: [
    { title: 'Neurons & layers', text: 'From one perceptron to a stack of them.', icon: 'Network', go: 'lessons' },
    { title: 'Backpropagation', text: 'Chain rule, gradients and weight updates.', icon: 'Waypoints', go: 'lessons' },
    { title: 'Convolutional nets', text: 'Convolutions for images and spatial data.', icon: 'Layers', go: 'lessons' },
    { title: 'Sequences & attention', text: 'RNNs, attention and transformers.', icon: 'AudioLines', go: 'lessons' },
    { title: 'Ship a model', text: 'Export, serve and monitor your trained network.', icon: 'Rocket', go: 'lessons' },
  ]},
  { id: 'cutting-edge', name: 'Cutting-Edge AI', steps: [
    { title: 'LLMs & Transformers', text: 'Understanding attention mechanisms, tokenization, and prompt engineering.', icon: 'BrainCircuit', go: 'lessons' },
    { title: 'RAG Workflows', text: 'Connecting LLMs to external data sources.', icon: 'FileSearch', go: 'lessons' },
    { title: 'Edge AI & TinyML', text: 'Compiling and quantizing models to run efficiently on resource-constrained edge hardware and microcontrollers.', icon: 'Cpu', go: 'lessons' },
    { title: 'MLOps & Deployment', text: 'Tracking model experiments with MLflow, serializing models, and serving them as production-ready APIs using FastAPI.', icon: 'ServerCog', go: 'lessons' },
    { title: 'Get certified', text: 'Finish every course and claim your certificate.', icon: 'Award', go: 'certificate' },
  ]}
]