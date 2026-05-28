---
name: Mister
description: Enables Mister to dispatch tasks to specialized agents.
author: auto
created: 2026-05-28
---

# Mister Skill

This skill gives the **Mister** agent the ability to forward user requests to other agents using a dispatch tool.

## Core Features
- **Dispatch**: Forwards tasks to predefined agent scripts.  
- **Greeting**: Starts with a friendly greeting to the user.  
- **Playbook**: Follows a sequence defined in the main Markdown plan.

## Usage
1. Create dispatch scripts in `dispatch/` (e.g., `validate_request.py`).  
2. Mister invokes the appropriate script based on task type.  
3. Results are returned to the user.

## Directory Structure
```
skills/mister/
├── SKILL.md
├── dispatch/
│   └── example.py
└── README.md
```

## Next Steps
- Implement the dispatch scripts.  
- Integrate Mister into the main `brigada_de_validade.md` plan.