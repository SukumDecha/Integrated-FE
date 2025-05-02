# 📁 Cooperative File Naming & Folder Structure Guide

## 🧭 Purpose

This document outlines the standardized file naming conventions and folder structures adopted by our cooperative. Adhering to these guidelines ensures:

- Efficient file organization and retrieval
- Enhanced collaboration among team members
- Reduced risk of misplaced or duplicate files
- Improved clarity for both current and future members

---

## 📂 Folder Structure Overview

The following structure reflects our Vue.js project layout:

```
INTEGRATED-FE/
├── .vscode/
├── node_modules/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   │   └── XButton.vue
│   │   ├── layout/
│   │   │   └── Navbar.vue
│   │   └── sale-item/
│   │       └── SaleItemGallery.vue
│   ├── router/
│   ├── services/
│   │   └── sale-item.service.ts
│   ├── stores/
│   │   └── toast.store.js
│   ├── utils/
│   │   └── DateUtils.js
│   └── views/
│       ├── sale-item/
│       │   ├── SaleItemDetails.vue
│       │   └── SaleItemGallery.vue
│       └── HomeView.vue
├── App.vue
└── main.js
```

**Guidelines:**

- Group reusable UI components under `components/`
- Organize pages or views under `views/`
- Keep services for API calls in the `services/` folder
- Use `stores/` for state management (e.g., Pinia or Vuex)
- Utility functions belong in `utils/`
- Route definitions live in `router/`

---

## 📝 File Naming Convention

Standardize file names using the following format:

```
[YYYYMMDD]_[ModuleName]_[Description]_v[VersionNumber].[Extension]
```

### Components

- `YYYYMMDD`: Date in YearMonthDay format (e.g., 20250430)
- `ModuleName`: Area/module (e.g., SaleItem, Navbar)
- `Description`: Short explanation of file purpose
- `v[VersionNumber]`: Version (e.g., v01, v02)
- `Extension`: Vue, JS, TS, etc.

**Example:**

```
20250430_SaleItem_Service_v01.ts
```

---

## 🔄 Version Control

- Maintain history by incrementing `v` numbers
- Append `_DRAFT` or `_FINAL` if applicable

---

## 🛠 Additional Tips

- **Use PascalCase** for Vue components (e.g., `SaleItemGallery.vue`)
- **Use camelCase** for JS variables and functions
- Maintain folder-specific focus (no mixing logic across modules)

Store this file as `README.md` in the root of the repository.
