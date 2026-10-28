// status: 'done' | 'current' | 'todo'  ·  icon: a key from ICONS in Roadmap.jsx  ·  go: page the tile opens
export const TRACKS = [
  { id: 'python', name: 'Python & NumPy', steps: [
    { title: 'Python basics', text: 'Variables, loops, functions and reading error messages.', icon: 'Terminal', status: 'done', go: 'lessons' },
    { title: 'NumPy arrays', text: 'Vectors, matrices, shapes and broadcasting.', icon: 'Grid3x3', status: 'done', go: 'playground' },
    { title: 'Data wrangling', text: 'Load, clean and slice datasets with pandas.', icon: 'Table2', status: 'done', go: 'lessons' },
    { title: 'Visualize data', text: 'Plot distributions and relationships between features.', icon: 'BarChart3', status: 'current', go: 'playground' },
    { title: 'Checkpoint quiz', text: 'Prove you can move data around without a loop.', icon: 'ListChecks', status: 'todo', go: 'quizzes' },
  ]},
  { id: 'supervised', name: 'Supervised Learning', steps: [
    { title: 'Features & labels', text: 'Frame a problem as inputs, targets and a hypothesis function.', icon: 'Tags', status: 'done', go: 'lessons' },
    { title: 'Linear regression', text: 'Fit a line with weights and a bias term.', icon: 'TrendingUp', status: 'done', go: 'playground' },
    { title: 'Cost & gradient descent', text: 'Minimize mean squared error one step at a time.', icon: 'TrendingDown', status: 'current', go: 'lessons' },
    { title: 'Classification', text: 'Logistic regression, cross-entropy and decision boundaries.', icon: 'Split', status: 'todo', go: 'lessons' },
    { title: 'Evaluate models', text: 'Train/test splits, overfitting and metrics.', icon: 'Gauge', status: 'todo', go: 'quizzes' },
    { title: 'Get certified', text: 'Finish every lab and claim your certificate.', icon: 'Award', status: 'todo', go: 'certificate' },
  ]},
  { id: 'deep', name: 'Deep Learning', steps: [
    { title: 'Neurons & layers', text: 'From one perceptron to a stack of them.', icon: 'Network', status: 'todo', go: 'lessons' },
    { title: 'Backpropagation', text: 'Chain rule, gradients and weight updates.', icon: 'Waypoints', status: 'todo', go: 'playground' },
    { title: 'Convolutional nets', text: 'Convolutions for images and spatial data.', icon: 'Layers', status: 'todo', go: 'lessons' },
    { title: 'Sequences & attention', text: 'RNNs, attention and transformers.', icon: 'AudioLines', status: 'todo', go: 'lessons' },
    { title: 'Ship a model', text: 'Export, serve and monitor your trained network.', icon: 'Rocket', status: 'todo', go: 'playground' },
  ]},
  { id: 'cutting-edge', name: 'Cutting-Edge AI', steps: [
    { title: 'LLMs & Transformers', text: 'Understanding attention mechanisms, tokenization, and prompt engineering.', icon: 'BrainCircuit', status: 'todo', go: 'lessons' },
    { title: 'RAG Workflows', text: 'Connecting LLMs to external data sources.', icon: 'FileSearch', status: 'todo', go: 'playground' },
    { title: 'Edge AI & TinyML', text: 'Compiling and quantizing models to run efficiently on resource-constrained edge hardware and microcontrollers.', icon: 'Cpu', status: 'todo', go: 'lessons' },
    { title: 'MLOps & Deployment', text: 'Tracking model experiments with MLflow, serializing models, and serving them as production-ready APIs using FastAPI.', icon: 'ServerCog', status: 'todo', go: 'lessons' },
    { title: 'Get certified', text: 'Finish every course and claim your certificate.', icon: 'Award', status: 'todo', go: 'certificate' },
  ]}
]
