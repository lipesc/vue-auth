# Integração com Spring Boot / Spring Java Backend

Este documento explica como integrar esta aplicação Vue.js com autenticação Firebase com um backend Spring Java.

## Visão Geral da Arquitetura

A aplicação Vue.js atual usa Firebase Authentication para gerenciar usuários. Para integrar com um backend Spring:

1. **Frontend (Vue.js)**: Autentica usuários via Firebase e obtém um ID Token
2. **Backend (Spring Boot)**: Valida o Firebase ID Token e gerencia a lógica de negócio

## Fluxo de Autenticação

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Vue.js    │────────▶│   Firebase   │         │   Spring    │
│  Frontend   │         │     Auth     │         │   Backend   │
└─────────────┘         └──────────────┘         └─────────────┘
      │                        │                         │
      │  1. Login              │                         │
      │───────────────────────▶│                         │
      │                        │                         │
      │  2. ID Token           │                         │
      │◀───────────────────────│                         │
      │                        │                         │
      │  3. API Request + Token                          │
      │─────────────────────────────────────────────────▶│
      │                        │                         │
      │                        │  4. Verify Token        │
      │                        │◀────────────────────────│
      │                        │                         │
      │                        │  5. Token Valid         │
      │                        │─────────────────────────▶│
      │                        │                         │
      │  6. API Response                                 │
      │◀─────────────────────────────────────────────────│
```

## Passo 1: Configuração do Frontend Vue.js

### 1.1. Modificar requisições HTTP para incluir o token

Crie um serviço HTTP que intercepta todas as requisições e adiciona o Firebase ID Token:

```javascript
// src/services/api.js
import { auth } from '../firebase';

const API_BASE_URL = 'http://localhost:8080/api'; // URL do seu backend Spring

export const apiClient = {
  async get(endpoint) {
    const token = await auth.currentUser?.getIdToken();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  async post(endpoint, data) {
    const token = await auth.currentUser?.getIdToken();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async put(endpoint, data) {
    const token = await auth.currentUser?.getIdToken();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async delete(endpoint) {
    const token = await auth.currentUser?.getIdToken();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },
};
```

### 1.2. Usar o serviço em componentes

```javascript
// Exemplo de uso em um componente Vue
import { apiClient } from '../services/api';

export default {
  async mounted() {
    try {
      const data = await apiClient.get('/users/profile');
      console.log('Dados do usuário:', data);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  },
};
```

## Passo 2: Configuração do Backend Spring Boot

### 2.1. Dependências Maven (pom.xml)

Adicione as dependências necessárias no seu `pom.xml`:

```xml
<dependencies>
    <!-- Spring Boot Starter Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <!-- Spring Boot Starter Security -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>

    <!-- Firebase Admin SDK -->
    <dependency>
        <groupId>com.google.firebase</groupId>
        <artifactId>firebase-admin</artifactId>
        <version>9.2.0</version>
    </dependency>
</dependencies>
```

### 2.2. Configuração do Firebase Admin SDK

Crie uma classe de configuração para inicializar o Firebase Admin SDK:

```java
package com.example.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PostConstruct;
import java.io.FileInputStream;
import java.io.IOException;

@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void initialize() throws IOException {
        // Baixe o arquivo de credenciais do Firebase Console:
        // Project Settings > Service Accounts > Generate New Private Key
        FileInputStream serviceAccount = new FileInputStream("path/to/serviceAccountKey.json");

        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .build();

        if (FirebaseApp.getApps().isEmpty()) {
            FirebaseApp.initializeApp(options);
        }
    }
}
```

**Nota**: Para produção, armazene o arquivo de credenciais de forma segura (variáveis de ambiente, AWS Secrets Manager, etc.)

### 2.3. Filtro de Autenticação

Crie um filtro para validar o Firebase ID Token em cada requisição:

```java
package com.example.security;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;

@Component
public class FirebaseAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        
        String authorizationHeader = request.getHeader("Authorization");

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String token = authorizationHeader.substring(7);
            
            try {
                FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);
                String uid = decodedToken.getUid();
                String email = decodedToken.getEmail();

                // Criar um objeto de autenticação do Spring Security
                UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(email, null, new ArrayList<>());
                
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                // Definir o contexto de segurança
                SecurityContextHolder.getContext().setAuthentication(authentication);
                
                // Adicionar informações do usuário no request para uso posterior
                request.setAttribute("firebaseUid", uid);
                request.setAttribute("firebaseEmail", email);
                
            } catch (FirebaseAuthException e) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("Token inválido: " + e.getMessage());
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
```

### 2.4. Configuração de Segurança

Configure o Spring Security para usar o filtro personalizado:

```java
package com.example.config;

import com.example.security.FirebaseAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private FirebaseAuthenticationFilter firebaseAuthenticationFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors().and()
            .csrf().disable()
            .authorizeRequests()
                .antMatchers("/api/public/**").permitAll() // Endpoints públicos
                .antMatchers("/api/**").authenticated() // Todos os outros precisam de autenticação
                .anyRequest().permitAll()
            .and()
            .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS) // Sem sessões
            .and()
            .addFilterBefore(firebaseAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173", "https://vue3-heroku-app-3e0438eb2396.herokuapp.com"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
```

### 2.5. Exemplo de Controller

```java
package com.example.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class UserController {

    @GetMapping("/users/profile")
    public Map<String, Object> getUserProfile(HttpServletRequest request) {
        // Obter informações do usuário autenticado
        String firebaseUid = (String) request.getAttribute("firebaseUid");
        String firebaseEmail = (String) request.getAttribute("firebaseEmail");
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        Map<String, Object> response = new HashMap<>();
        response.put("uid", firebaseUid);
        response.put("email", firebaseEmail);
        response.put("authenticated", authentication != null && authentication.isAuthenticated());
        
        return response;
    }

    @PostMapping("/users/data")
    public Map<String, Object> createUserData(@RequestBody Map<String, Object> userData, 
                                               HttpServletRequest request) {
        String firebaseUid = (String) request.getAttribute("firebaseUid");
        
        // Associar dados ao UID do Firebase
        userData.put("firebaseUid", firebaseUid);
        
        // Salvar no banco de dados...
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Dados salvos com sucesso");
        response.put("data", userData);
        
        return response;
    }
}
```

## Passo 3: Configuração do Arquivo de Credenciais

### 3.1. Obter Service Account Key

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá para **Project Settings** (Configurações do Projeto)
4. Clique na aba **Service Accounts**
5. Clique em **Generate New Private Key**
6. Baixe o arquivo JSON

### 3.2. Configurar no Spring Boot

**Opção 1: Via arquivo** (desenvolvimento)
```java
FileInputStream serviceAccount = new FileInputStream("serviceAccountKey.json");
```

**Opção 2: Via variável de ambiente** (produção)
```java
// application.properties
firebase.credentials.path=${FIREBASE_CREDENTIALS_PATH}

// FirebaseConfig.java
@Value("${firebase.credentials.path}")
private String credentialsPath;

FileInputStream serviceAccount = new FileInputStream(credentialsPath);
```

**Opção 3: Via string JSON** (produção)
```java
// application.properties
firebase.credentials.json=${FIREBASE_CREDENTIALS_JSON}

// FirebaseConfig.java
@Value("${firebase.credentials.json}")
private String credentialsJson;

InputStream serviceAccount = new ByteArrayInputStream(credentialsJson.getBytes());
```

## Passo 4: Gestão de Usuários no Backend

### 4.1. Entidade de Usuário

```java
package com.example.model;

import javax.persistence.*;

@Entity
@Table(name = "users")
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String firebaseUid;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    private String displayName;
    
    private String photoUrl;
    
    // Getters e Setters
}
```

### 4.2. Repository

```java
package com.example.repository;

import com.example.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByFirebaseUid(String firebaseUid);
    Optional<User> findByEmail(String email);
}
```

### 4.3. Service

```java
package com.example.service;

import com.example.model.User;
import com.example.repository.UserRepository;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User findOrCreateUser(String firebaseUid) throws FirebaseAuthException {
        return userRepository.findByFirebaseUid(firebaseUid)
            .orElseGet(() -> {
                try {
                    UserRecord userRecord = FirebaseAuth.getInstance().getUser(firebaseUid);
                    User newUser = new User();
                    newUser.setFirebaseUid(firebaseUid);
                    newUser.setEmail(userRecord.getEmail());
                    newUser.setDisplayName(userRecord.getDisplayName());
                    newUser.setPhotoUrl(userRecord.getPhotoUrl());
                    return userRepository.save(newUser);
                } catch (FirebaseAuthException e) {
                    throw new RuntimeException("Erro ao criar usuário", e);
                }
            });
    }
}
```

## Passo 5: Tratamento de Erros

### 5.1. Exception Handler Global

```java
package com.example.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleException(Exception e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", e.getMessage());
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<Map<String, String>> handleUnauthorizedException(UnauthorizedException e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", e.getMessage());
        return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
    }
}
```

## Passo 6: Testes

### 6.1. Testar com Postman ou cURL

```bash
# Obter o token do console do navegador (após login no Vue.js)
# No console do navegador, execute:
# firebase.auth().currentUser.getIdToken().then(token => console.log(token))

# Fazer requisição com o token
curl -X GET http://localhost:8080/api/users/profile \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json"
```

## Considerações de Segurança

1. **HTTPS**: Sempre use HTTPS em produção para proteger os tokens
2. **Token Expiration**: Tokens do Firebase expiram após 1 hora. O SDK do Firebase no frontend renova automaticamente
3. **Validação do Token**: Sempre valide o token no backend, nunca confie apenas no frontend
4. **CORS**: Configure CORS adequadamente para permitir apenas origens confiáveis
5. **Rate Limiting**: Implemente rate limiting para proteger contra ataques de força bruta
6. **Secrets**: Nunca commit o arquivo `serviceAccountKey.json` no Git. Use `.gitignore`

## Variáveis de Ambiente

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### Backend (application.properties)
```properties
server.port=8080
spring.application.name=vue-auth-backend

# Firebase
firebase.credentials.path=${FIREBASE_CREDENTIALS_PATH:serviceAccountKey.json}

# CORS
cors.allowed.origins=http://localhost:5173,https://vue3-heroku-app-3e0438eb2396.herokuapp.com

# Database (exemplo com PostgreSQL)
spring.datasource.url=${DATABASE_URL:jdbc:postgresql://localhost:5432/vueauth}
spring.datasource.username=${DATABASE_USERNAME:postgres}
spring.datasource.password=${DATABASE_PASSWORD:password}
spring.jpa.hibernate.ddl-auto=update
```

## Estrutura de Projeto Recomendada

```
spring-backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── example/
│   │   │           ├── config/
│   │   │           │   ├── FirebaseConfig.java
│   │   │           │   └── SecurityConfig.java
│   │   │           ├── controller/
│   │   │           │   └── UserController.java
│   │   │           ├── model/
│   │   │           │   └── User.java
│   │   │           ├── repository/
│   │   │           │   └── UserRepository.java
│   │   │           ├── security/
│   │   │           │   └── FirebaseAuthenticationFilter.java
│   │   │           ├── service/
│   │   │           │   └── UserService.java
│   │   │           ├── exception/
│   │   │           │   ├── GlobalExceptionHandler.java
│   │   │           │   └── UnauthorizedException.java
│   │   │           └── Application.java
│   │   └── resources/
│   │       ├── application.properties
│   │       └── serviceAccountKey.json (NÃO COMMITAR!)
│   └── test/
│       └── java/
├── .gitignore
└── pom.xml
```

## Recursos Adicionais

- [Firebase Admin SDK - Java](https://firebase.google.com/docs/admin/setup)
- [Verificar ID Tokens](https://firebase.google.com/docs/auth/admin/verify-id-tokens)
- [Spring Security](https://spring.io/projects/spring-security)
- [CORS no Spring](https://spring.io/guides/gs/rest-service-cors/)

## Conclusão

Esta integração permite que você:
1. Mantenha a autenticação no Firebase (facilidade de uso, providers OAuth, etc.)
2. Valide tokens no backend Spring de forma segura
3. Gerencie lógica de negócio e dados no backend
4. Mantenha uma arquitetura desacoplada e escalável

O Firebase cuida da autenticação, enquanto o Spring cuida da lógica de negócio e acesso a dados.
