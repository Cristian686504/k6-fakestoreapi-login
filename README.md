# k6 - Prueba de Carga al Login de FakeStoreAPI

Proyecto de pruebas de rendimiento con **k6** sobre el endpoint de autenticación (`/auth/login`) de [FakeStoreAPI](https://fakestoreapi.com).

---

## Tecnologías y Versiones

| Tecnología | Versión |
|---|---|
| **k6** | v1.7.0 |
| **Go** (runtime de k6) | 1.26.1 |
| **SO de ejecución** | Windows 11 (amd64) |
| **Librería papaparse** (CSV) | 5.1.1 (jslib k6) |
| **Librería k6-summary** | 0.1.0 (jslib k6) |

> No se requiere Node.js ni npm. k6 es un binario standalone.

---

## Estructura del Proyecto

```
k6-fakestoreapi-login/
├── config/
│   └── options.js          # Configuración del escenario, thresholds y carga de datos CSV
├── data/
│   └── users.csv           # Datos parametrizados de usuarios para el login
├── helpers/
│   ├── checks.js           # Validaciones (checks) sobre la respuesta HTTP
│   └── requests.js         # Funciones HTTP para interactuar con la API
├── reports/
│   └── .gitkeep            # Carpeta donde se generan los reportes JSON
├── scripts/
│   └── login-load-test.js  # Script principal de la prueba de carga
├── .gitignore
├── CONCLUSIONES.md          # Hallazgos y conclusiones de la ejecución
└── README.md                # Este archivo
```

---

## Prerrequisitos

### 1. Instalar k6

**Windows (Chocolatey):**
```powershell
choco install k6
```

**Windows (Winget):**
```powershell
winget install k6 --source winget
```

**macOS (Homebrew):**
```bash
brew install k6
```

**Linux (Debian/Ubuntu):**
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

### 2. Verificar la instalación
```bash
k6 version
# Esperado: k6.exe v1.7.0 (o superior)
```

---

## Ejecución Paso a Paso

### 1. Clonar el repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd k6-fakestoreapi-login
```

### 2. Ejecutar la prueba de carga
```bash
k6 run scripts/login-load-test.js
```

Esto ejecutará:
- **20 TPS** (transacciones por segundo) sostenidos durante **1 minuto**
- Usando el executor `constant-arrival-rate`
- Con los usuarios parametrizados desde `data/users.csv`

### 3. Revisar los reportes

Al finalizar la ejecución, los reportes se generan automáticamente en la carpeta `reports/`:

- `reports/latest_summary.json` — Último reporte generado (se sobreescribe)
- `reports/summary_<timestamp>.json` — Reporte con marca de tiempo única

---

## Datos de Prueba

Los usuarios se cargan desde `data/users.csv`:

| Usuario | Contraseña | Estado en la API |
|---|---|---|
| donero | ewedon | ✅ Login exitoso (201) |
| kevinryan | kev02937@ | ✅ Login exitoso (201) |
| johnd | m38rmF$ | ✅ Login exitoso (201) |
| derek | jklg*_56 | ✅ Login exitoso (201) |
| mor_2314 | 83r5^_ | ✅ Login exitoso (201) |

> **Nota:** Todos los usuarios tienen credenciales válidas. Solo el código HTTP 201 es considerado como respuesta exitosa.

---

## Criterios de Aceptación (Thresholds)

| Métrica | Umbral | Descripción |
|---|---|---|
| `http_req_duration` | p(95) < 1500ms | El 95% de las peticiones deben responder en menos de 1.5 segundos |
| `http_req_failed` | rate < 0.03 (3%) | La tasa de error inesperado debe ser menor al 3% |

### Checks (validaciones por petición)

| Check | Descripción |
|---|---|
| `status is 201` | El código de respuesta es 201 (login exitoso) |
| `response time < 1500ms` | El tiempo de respuesta individual es menor a 1500ms |
| `response body contains token` | La respuesta contiene un JWT token |
| `no server errors (5xx)` | No se reciben errores de servidor |

---

## Configuración del Escenario

```javascript
scenarios: {
  login_load_test: {
    executor: 'constant-arrival-rate', // Tasa constante de llegada
    rate: 20,                          // 20 iteraciones por segundo (TPS)
    timeUnit: '1s',
    duration: '1m',                    // Duración: 1 minuto
    preAllocatedVUs: 50,               // VUs pre-asignados
    maxVUs: 100,                       // Máximo de VUs
  },
}
```

---

## Endpoint Bajo Prueba

```
POST https://fakestoreapi.com/auth/login
Content-Type: application/json

{
  "username": "<usuario>",
  "password": "<contraseña>"
}
```

**Respuesta esperada:**
- `201 Created` — Login exitoso, retorna `{ "token": "<JWT>" }`