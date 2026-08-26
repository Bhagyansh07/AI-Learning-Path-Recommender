// ============================================================
// SKILL GRAPH DAG — The Brain of the System
// 65 skills, prerequisite edges, difficulty, estimated hours
// This is NOT an LLM. This is algorithmic intelligence.
// ============================================================

export const SKILL_GRAPH = {
  skills: [
    // ── Programming Fundamentals ──
    { id: 'computer-science-basics', name: 'Computer Science Basics', domain: 'programming', difficulty: 1, estimated_hours: 15, prerequisites: [], resources: [{ type: 'course', title: 'CS Fundamentals', platform: 'NPTEL', free: true }, { type: 'project', title: 'Binary Calculator', difficulty: 1 }] },
    { id: 'python-basics', name: 'Python Basics', domain: 'programming', difficulty: 1, estimated_hours: 25, prerequisites: ['computer-science-basics'], resources: [{ type: 'course', title: 'Python for Beginners', platform: 'SWAYAM', free: true }, { type: 'project', title: 'Todo App in Python', difficulty: 1 }] },
    { id: 'javascript-basics', name: 'JavaScript Basics', domain: 'programming', difficulty: 1, estimated_hours: 20, prerequisites: ['computer-science-basics'], resources: [{ type: 'course', title: 'JavaScript Essentials', platform: 'freeCodeCamp', free: true }, { type: 'project', title: 'Interactive Quiz', difficulty: 1 }] },
    { id: 'java-basics', name: 'Java Basics', domain: 'programming', difficulty: 1, estimated_hours: 30, prerequisites: ['computer-science-basics'], resources: [{ type: 'course', title: 'Java Programming', platform: 'NPTEL', free: true }, { type: 'project', title: 'Student Management System', difficulty: 1 }] },
    { id: 'git-version-control', name: 'Git & Version Control', domain: 'programming', difficulty: 1, estimated_hours: 8, prerequisites: [], resources: [{ type: 'course', title: 'Git & GitHub Crash Course', platform: 'YouTube', free: true }, { type: 'project', title: 'Open Source Contribution', difficulty: 1 }] },
    { id: 'data-structures-algorithms', name: 'Data Structures & Algorithms', domain: 'programming', difficulty: 2, estimated_hours: 60, prerequisites: ['python-basics'], resources: [{ type: 'course', title: 'DSA using Python', platform: 'NPTEL', free: true }, { type: 'project', title: 'Implement a Linked List', difficulty: 2 }] },
    { id: 'oop-concepts', name: 'Object-Oriented Programming', domain: 'programming', difficulty: 2, estimated_hours: 20, prerequisites: ['python-basics'], resources: [{ type: 'course', title: 'OOP in Python', platform: 'Coursera', free: true }, { type: 'project', title: 'Library Management System', difficulty: 2 }] },
    { id: 'sql-databases', name: 'SQL & Databases', domain: 'programming', difficulty: 2, estimated_hours: 25, prerequisites: ['computer-science-basics'], resources: [{ type: 'course', title: 'SQL for Data Science', platform: 'SWAYAM', free: true }, { type: 'project', title: 'E-commerce Database Design', difficulty: 2 }] },
    { id: 'linux-basics', name: 'Linux & Command Line', domain: 'programming', difficulty: 1, estimated_hours: 12, prerequisites: [], resources: [{ type: 'course', title: 'Linux Command Line', platform: 'YouTube', free: true }, { type: 'project', title: 'Shell Script Automation', difficulty: 1 }] },

    // ── Web Development ──
    { id: 'html-css', name: 'HTML & CSS', domain: 'web_development', difficulty: 1, estimated_hours: 20, prerequisites: [], resources: [{ type: 'course', title: 'HTML & CSS Complete Course', platform: 'freeCodeCamp', free: true }, { type: 'project', title: 'Portfolio Website', difficulty: 1 }] },
    { id: 'responsive-design', name: 'Responsive Web Design', domain: 'web_development', difficulty: 1, estimated_hours: 15, prerequisites: ['html-css'], resources: [{ type: 'course', title: 'Responsive Design', platform: 'freeCodeCamp', free: true }, { type: 'project', title: 'Multi-device Landing Page', difficulty: 1 }] },
    { id: 'dom-manipulation', name: 'DOM Manipulation', domain: 'web_development', difficulty: 2, estimated_hours: 20, prerequisites: ['javascript-basics', 'html-css'], resources: [{ type: 'course', title: 'JavaScript DOM', platform: 'Udemy', free: true }, { type: 'project', title: 'Interactive Dashboard', difficulty: 2 }] },
    { id: 'react-basics', name: 'React.js Basics', domain: 'web_development', difficulty: 2, estimated_hours: 35, prerequisites: ['javascript-basics', 'html-css'], resources: [{ type: 'course', title: 'React for Beginners', platform: 'YouTube', free: true }, { type: 'project', title: 'Task Manager App', difficulty: 2 }] },
    { id: 'nodejs-express', name: 'Node.js & Express', domain: 'web_development', difficulty: 2, estimated_hours: 30, prerequisites: ['javascript-basics', 'sql-databases'], resources: [{ type: 'course', title: 'Node.js Bootcamp', platform: 'Udemy', free: true }, { type: 'project', title: 'REST API Service', difficulty: 2 }] },
    { id: 'mongodb', name: 'MongoDB & NoSQL', domain: 'web_development', difficulty: 2, estimated_hours: 15, prerequisites: ['javascript-basics'], resources: [{ type: 'course', title: 'MongoDB University', platform: 'MongoDB', free: true }, { type: 'project', title: 'Blog with MongoDB', difficulty: 2 }] },
    { id: 'typescript', name: 'TypeScript', domain: 'web_development', difficulty: 2, estimated_hours: 20, prerequisites: ['javascript-basics'], resources: [{ type: 'course', title: 'TypeScript Course', platform: 'Udemy', free: true }, { type: 'project', title: 'Type-safe API', difficulty: 2 }] },
    { id: 'nextjs', name: 'Next.js', domain: 'web_development', difficulty: 3, estimated_hours: 30, prerequisites: ['react-basics', 'nodejs-express'], resources: [{ type: 'course', title: 'Next.js Academy', platform: 'Vercel', free: true }, { type: 'project', title: 'Full-stack Blog', difficulty: 3 }] },
    { id: 'frontend-testing', name: 'Frontend Testing', domain: 'web_development', difficulty: 3, estimated_hours: 15, prerequisites: ['react-basics'], resources: [{ type: 'course', title: 'Testing React Apps', platform: 'Udemy', free: true }, { type: 'project', title: 'Write Tests for Todo App', difficulty: 3 }] },

    // ── Data Science ──
    { id: 'statistics-basics', name: 'Statistics & Probability', domain: 'data_science', difficulty: 2, estimated_hours: 30, prerequisites: ['python-basics'], resources: [{ type: 'course', title: 'Statistics for Data Science', platform: 'NPTEL', free: true }, { type: 'project', title: 'A/B Test Analysis', difficulty: 2 }] },
    { id: 'numpy-pandas', name: 'NumPy & Pandas', domain: 'data_science', difficulty: 2, estimated_hours: 25, prerequisites: ['python-basics'], resources: [{ type: 'course', title: 'Data Analysis with Python', platform: 'Coursera', free: true }, { type: 'project', title: 'Sales Data Analysis', difficulty: 2 }] },
    { id: 'data-visualization', name: 'Data Visualization', domain: 'data_science', difficulty: 2, estimated_hours: 20, prerequisites: ['numpy-pandas'], resources: [{ type: 'course', title: 'Data Viz with Python', platform: 'SWAYAM', free: true }, { type: 'project', title: 'COVID Dashboard', difficulty: 2 }] },
    { id: 'data-cleaning', name: 'Data Cleaning & Preprocessing', domain: 'data_science', difficulty: 2, estimated_hours: 15, prerequisites: ['numpy-pandas'], resources: [{ type: 'course', title: 'Data Cleaning Masterclass', platform: 'YouTube', free: true }, { type: 'project', title: 'Clean Messy Dataset', difficulty: 2 }] },
    { id: 'feature-engineering', name: 'Feature Engineering', domain: 'data_science', difficulty: 3, estimated_hours: 20, prerequisites: ['numpy-pandas', 'statistics-basics'], resources: [{ type: 'course', title: 'Feature Engineering', platform: 'Kaggle', free: true }, { type: 'project', title: 'Feature Selection for ML', difficulty: 3 }] },
    { id: 'sql-analytics', name: 'SQL for Analytics', domain: 'data_science', difficulty: 2, estimated_hours: 20, prerequisites: ['sql-databases'], resources: [{ type: 'course', title: 'Advanced SQL', platform: 'Mode Analytics', free: true }, { type: 'project', title: 'Business Analytics Query', difficulty: 2 }] },

    // ── Machine Learning ──
    { id: 'machine-learning', name: 'Machine Learning Fundamentals', domain: 'machine_learning', difficulty: 3, estimated_hours: 50, prerequisites: ['numpy-pandas', 'statistics-basics'], resources: [{ type: 'course', title: 'ML Specialization', platform: 'Coursera', free: true }, { type: 'project', title: 'House Price Predictor', difficulty: 3 }] },
    { id: 'supervised-learning', name: 'Supervised Learning', domain: 'machine_learning', difficulty: 3, estimated_hours: 30, prerequisites: ['machine-learning'], resources: [{ type: 'course', title: 'Supervised ML', platform: 'Coursera', free: true }, { type: 'project', title: 'Email Spam Classifier', difficulty: 3 }] },
    { id: 'unsupervised-learning', name: 'Unsupervised Learning', domain: 'machine_learning', difficulty: 3, estimated_hours: 25, prerequisites: ['machine-learning'], resources: [{ type: 'course', title: 'Unsupervised Learning', platform: 'Coursera', free: true }, { type: 'project', title: 'Customer Segmentation', difficulty: 3 }] },
    { id: 'model-evaluation', name: 'Model Evaluation & Selection', domain: 'machine_learning', difficulty: 3, estimated_hours: 15, prerequisites: ['machine-learning'], resources: [{ type: 'course', title: 'Model Evaluation', platform: 'Kaggle', free: true }, { type: 'project', title: 'Cross-validation Pipeline', difficulty: 3 }] },

    // ── Deep Learning ──
    { id: 'deep-learning', name: 'Deep Learning Fundamentals', domain: 'machine_learning', difficulty: 4, estimated_hours: 40, prerequisites: ['machine-learning', 'linear-algebra'], resources: [{ type: 'course', title: 'Deep Learning Specialization', platform: 'Coursera', free: true }, { type: 'project', title: 'MNIST Digit Classifier', difficulty: 4 }] },
    { id: 'cnn', name: 'Convolutional Neural Networks', domain: 'machine_learning', difficulty: 4, estimated_hours: 30, prerequisites: ['deep-learning'], resources: [{ type: 'course', title: 'CS231n CNNs', platform: 'Stanford', free: true }, { type: 'project', title: 'Image Classification App', difficulty: 4 }] },
    { id: 'nlp', name: 'Natural Language Processing', domain: 'machine_learning', difficulty: 4, estimated_hours: 35, prerequisites: ['deep-learning'], resources: [{ type: 'course', title: 'NLP Specialization', platform: 'Coursera', free: true }, { type: 'project', title: 'Sentiment Analyzer', difficulty: 4 }] },
    { id: 'transformers', name: 'Transformers & Attention', domain: 'machine_learning', difficulty: 5, estimated_hours: 40, prerequisites: ['nlp', 'deep-learning'], resources: [{ type: 'course', title: 'Transformers Course', platform: 'Hugging Face', free: true }, { type: 'project', title: 'Text Generator', difficulty: 5 }] },

    // ── Math foundations ──
    { id: 'linear-algebra', name: 'Linear Algebra', domain: 'math', difficulty: 2, estimated_hours: 25, prerequisites: ['computer-science-basics'], resources: [{ type: 'course', title: 'Linear Algebra', platform: 'NPTEL', free: true }, { type: 'project', title: 'Matrix Operations Library', difficulty: 2 }] },
    { id: 'calculus', name: 'Calculus for ML', domain: 'math', difficulty: 2, estimated_hours: 20, prerequisites: ['computer-science-basics'], resources: [{ type: 'course', title: 'Calculus for Engineers', platform: 'NPTEL', free: true }, { type: 'project', title: 'Gradient Descent Visualizer', difficulty: 2 }] },
    { id: 'discrete-math', name: 'Discrete Mathematics', domain: 'math', difficulty: 2, estimated_hours: 20, prerequisites: ['computer-science-basics'], resources: [{ type: 'course', title: 'Discrete Math', platform: 'NPTEL', free: true }, { type: 'project', title: 'Graph Theory Problems', difficulty: 2 }] },

    // ── Cloud & DevOps ──
    { id: 'cloud-computing-basics', name: 'Cloud Computing Basics', domain: 'cloud_computing', difficulty: 2, estimated_hours: 20, prerequisites: ['linux-basics'], resources: [{ type: 'course', title: 'Cloud Foundations', platform: 'AWS', free: true }, { type: 'project', title: 'Deploy Static Site to Cloud', difficulty: 2 }] },
    { id: 'aws-ec2-s3', name: 'AWS EC2 & S3', domain: 'cloud_computing', difficulty: 3, estimated_hours: 25, prerequisites: ['cloud-computing-basics'], resources: [{ type: 'course', title: 'AWS EC2 & S3', platform: 'AWS', free: true }, { type: 'project', title: 'Deploy App to AWS', difficulty: 3 }] },
    { id: 'docker', name: 'Docker & Containers', domain: 'cloud_computing', difficulty: 3, estimated_hours: 20, prerequisites: ['linux-basics'], resources: [{ type: 'course', title: 'Docker for Beginners', platform: 'YouTube', free: true }, { type: 'project', title: 'Containerize a Web App', difficulty: 3 }] },
    { id: 'kubernetes', name: 'Kubernetes', domain: 'cloud_computing', difficulty: 4, estimated_hours: 30, prerequisites: ['docker'], resources: [{ type: 'course', title: 'Kubernetes Tutorial', platform: 'YouTube', free: true }, { type: 'project', title: 'K8s Deployment', difficulty: 4 }] },
    { id: 'ci-cd', name: 'CI/CD Pipelines', domain: 'cloud_computing', difficulty: 3, estimated_hours: 15, prerequisites: ['docker', 'git-version-control'], resources: [{ type: 'course', title: 'CI/CD with GitHub Actions', platform: 'YouTube', free: true }, { type: 'project', title: 'Automated Testing Pipeline', difficulty: 3 }] },

    // ── Cybersecurity ──
    { id: 'networking-basics', name: 'Networking Fundamentals', domain: 'cybersecurity', difficulty: 2, estimated_hours: 20, prerequisites: ['linux-basics'], resources: [{ type: 'course', title: 'Networking Basics', platform: 'Coursera', free: true }, { type: 'project', title: 'Network Scanner', difficulty: 2 }] },
    { id: 'web-security', name: 'Web Application Security', domain: 'cybersecurity', difficulty: 3, estimated_hours: 25, prerequisites: ['networking-basics', 'javascript-basics'], resources: [{ type: 'course', title: 'Web Security', platform: 'OWASP', free: true }, { type: 'project', title: 'SQL Injection Demo', difficulty: 3 }] },
    { id: 'cryptography', name: 'Cryptography Basics', domain: 'cybersecurity', difficulty: 3, estimated_hours: 20, prerequisites: ['python-basics', 'linear-algebra'], resources: [{ type: 'course', title: 'Cryptography I', platform: 'Coursera', free: true }, { type: 'project', title: 'Encryption Tool', difficulty: 3 }] },

    // ── Mobile Development ──
    { id: 'flutter-basics', name: 'Flutter Basics', domain: 'mobile_development', difficulty: 2, estimated_hours: 30, prerequisites: ['dart-basics'], resources: [{ type: 'course', title: 'Flutter Crash Course', platform: 'YouTube', free: true }, { type: 'project', title: 'Calculator App', difficulty: 2 }] },
    { id: 'dart-basics', name: 'Dart Programming', domain: 'mobile_development', difficulty: 1, estimated_hours: 15, prerequisites: ['computer-science-basics'], resources: [{ type: 'course', title: 'Dart Language Tour', platform: 'dart.dev', free: true }, { type: 'project', title: 'CLI Tool', difficulty: 1 }] },
    { id: 'react-native', name: 'React Native', domain: 'mobile_development', difficulty: 3, estimated_hours: 35, prerequisites: ['react-basics'], resources: [{ type: 'course', title: 'React Native Course', platform: 'Udemy', free: true }, { type: 'project', title: 'Weather App', difficulty: 3 }] },
    { id: 'mobile-ui-design', name: 'Mobile UI/UX Design', domain: 'mobile_development', difficulty: 2, estimated_hours: 15, prerequisites: [], resources: [{ type: 'course', title: 'Mobile Design Patterns', platform: 'YouTube', free: true }, { type: 'project', title: 'App Mockup', difficulty: 2 }] },

    // ── MLOps & Deployment ──
    { id: 'model-deployment', name: 'ML Model Deployment', domain: 'mlops', difficulty: 3, estimated_hours: 25, prerequisites: ['machine-learning', 'python-basics'], resources: [{ type: 'course', title: 'MLOps Course', platform: 'Coursera', free: true }, { type: 'project', title: 'Deploy ML API', difficulty: 3 }] },
    { id: 'mlflow', name: 'MLflow & Experiment Tracking', domain: 'mlops', difficulty: 3, estimated_hours: 15, prerequisites: ['machine-learning'], resources: [{ type: 'course', title: 'MLflow Tutorial', platform: 'YouTube', free: true }, { type: 'project', title: 'Track Experiments', difficulty: 3 }] },
    { id: 'fastapi', name: 'FastAPI for ML Services', domain: 'mlops', difficulty: 3, estimated_hours: 20, prerequisites: ['python-basics', 'rest-apis'], resources: [{ type: 'course', title: 'FastAPI Course', platform: 'YouTube', free: true }, { type: 'project', title: 'ML Prediction API', difficulty: 3 }] },
    { id: 'rest-apis', name: 'REST API Design', domain: 'programming', difficulty: 2, estimated_hours: 15, prerequisites: ['python-basics'], resources: [{ type: 'course', title: 'RESTful API Design', platform: 'YouTube', free: true }, { type: 'project', title: 'Build a REST API', difficulty: 2 }] },

    // ── AI/Advanced ──
    { id: 'reinforcement-learning', name: 'Reinforcement Learning', domain: 'machine_learning', difficulty: 5, estimated_hours: 40, prerequisites: ['deep-learning', 'calculus'], resources: [{ type: 'course', title: 'RL Course', platform: 'Coursera', free: true }, { type: 'project', title: 'Game Playing Agent', difficulty: 5 }] },
    { id: 'computer-vision', name: 'Computer Vision', domain: 'machine_learning', difficulty: 4, estimated_hours: 35, prerequisites: ['cnn'], resources: [{ type: 'course', title: 'OpenCV Course', platform: 'YouTube', free: true }, { type: 'project', title: 'Face Detection App', difficulty: 4 }] },
    { id: 'generative-ai', name: 'Generative AI & LLMs', domain: 'machine_learning', difficulty: 4, estimated_hours: 30, prerequisites: ['transformers'], resources: [{ type: 'course', title: 'Generative AI Course', platform: 'Google', free: true }, { type: 'project', title: 'Chatbot with RAG', difficulty: 4 }] },
  ],

  career_paths: {
    data_scientist: {
      display_name: 'Data Scientist',
      description: 'Analyze data, build models, and extract insights to drive business decisions',
      target_skills: ['python-basics', 'sql-databases', 'statistics-basics', 'numpy-pandas', 'data-visualization', 'data-cleaning', 'feature-engineering', 'machine-learning', 'supervised-learning', 'unsupervised-learning', 'model-evaluation', 'sql-analytics'],
      avg_salary: '₹8-15 LPA',
      growth_rate: '36% (2023-2033)',
    },
    ml_engineer: {
      display_name: 'ML Engineer',
      description: 'Build, train, and deploy machine learning models at scale',
      target_skills: ['python-basics', 'data-structures-algorithms', 'statistics-basics', 'numpy-pandas', 'machine-learning', 'deep-learning', 'model-deployment', 'docker', 'fastapi', 'mlflow', 'model-evaluation'],
      avg_salary: '₹10-20 LPA',
      growth_rate: '40% (2023-2033)',
    },
    full_stack_developer: {
      display_name: 'Full Stack Developer',
      description: 'Build end-to-end web applications with modern frameworks',
      target_skills: ['html-css', 'javascript-basics', 'react-basics', 'nodejs-express', 'sql-databases', 'mongodb', 'git-version-control', 'typescript', 'nextjs', 'rest-apis'],
      avg_salary: '₹6-12 LPA',
      growth_rate: '25% (2023-2033)',
    },
    frontend_developer: {
      display_name: 'Frontend Developer',
      description: 'Create beautiful, responsive user interfaces for web applications',
      target_skills: ['html-css', 'responsive-design', 'javascript-basics', 'dom-manipulation', 'react-basics', 'typescript', 'nextjs', 'frontend-testing'],
      avg_salary: '₹5-10 LPA',
      growth_rate: '22% (2023-2033)',
    },
    cloud_engineer: {
      display_name: 'Cloud/DevOps Engineer',
      description: 'Design, deploy, and manage cloud infrastructure and CI/CD pipelines',
      target_skills: ['linux-basics', 'cloud-computing-basics', 'aws-ec2-s3', 'docker', 'kubernetes', 'ci-cd', 'python-basics', 'git-version-control'],
      avg_salary: '₹8-18 LPA',
      growth_rate: '32% (2023-2033)',
    },
    cybersecurity_analyst: {
      display_name: 'Cybersecurity Analyst',
      description: 'Protect systems and networks from cyber threats and vulnerabilities',
      target_skills: ['linux-basics', 'networking-basics', 'python-basics', 'web-security', 'cryptography', 'sql-databases'],
      avg_salary: '₹6-14 LPA',
      growth_rate: '35% (2023-2033)',
    },
    mobile_developer: {
      display_name: 'Mobile Developer',
      description: 'Build cross-platform mobile applications for iOS and Android',
      target_skills: ['dart-basics', 'flutter-basics', 'react-basics', 'react-native', 'mobile-ui-design', 'rest-apis', 'git-version-control'],
      avg_salary: '₹5-12 LPA',
      growth_rate: '25% (2023-2033)',
    },
    ai_researcher: {
      display_name: 'AI Research Scientist',
      description: 'Push the boundaries of AI with research in deep learning and NLP',
      target_skills: ['linear-algebra', 'calculus', 'statistics-basics', 'machine-learning', 'deep-learning', 'cnn', 'nlp', 'transformers', 'reinforcement-learning', 'computer-vision', 'generative-ai'],
      avg_salary: '₹12-30 LPA',
      growth_rate: '45% (2023-2033)',
    },
  },
};

// Skill demand scores (for Indian job market)
export const SKILL_DEMAND = {
  'python-basics': 0.95, 'javascript-basics': 0.9, 'sql-databases': 0.85,
  'machine-learning': 0.9, 'deep-learning': 0.85, 'docker': 0.8,
  'react-basics': 0.85, 'aws-ec2-s3': 0.8, 'kubernetes': 0.75,
  'numpy-pandas': 0.85, 'statistics-basics': 0.8, 'data-visualization': 0.7,
  'linux-basics': 0.75, 'git-version-control': 0.9, 'typescript': 0.75,
  'fastapi': 0.7, 'mlflow': 0.65, 'transformers': 0.8,
  'cnn': 0.75, 'nlp': 0.8, 'ci-cd': 0.75, 'mongodb': 0.7,
  'nextjs': 0.75, 'flutter-basics': 0.65, 'react-native': 0.7,
  'generative-ai': 0.85, 'computer-vision': 0.75, 'web-security': 0.7,
  'cryptography': 0.6, 'networking-basics': 0.7, 'rest-apis': 0.8,
  'oop-concepts': 0.75, 'data-structures-algorithms': 0.9,
  'feature-engineering': 0.7, 'data-cleaning': 0.7,
  'model-evaluation': 0.7, 'supervised-learning': 0.8, 'unsupervised-learning': 0.7,
  'model-deployment': 0.75, 'cloud-computing-basics': 0.7,
  'html-css': 0.8, 'responsive-design': 0.65, 'dom-manipulation': 0.6,
  'mobile-ui-design': 0.55, 'dart-basics': 0.5, 'reinforcement-learning': 0.5,
  'calculus': 0.5, 'linear-algebra': 0.6, 'discrete-math': 0.45,
  'computer-science-basics': 0.5, 'java-basics': 0.7, 'sql-analytics': 0.7,
  'frontend-testing': 0.6, 'nodejs-express': 0.8,
};

// Domain display names
export const DOMAIN_NAMES = {
  programming: 'Programming', web_development: 'Web Development',
  data_science: 'Data Science', machine_learning: 'Machine Learning',
  cloud_computing: 'Cloud & DevOps', cybersecurity: 'Cybersecurity',
  mobile_development: 'Mobile Development', math: 'Mathematics',
  mlops: 'MLOps & Deployment',
};
