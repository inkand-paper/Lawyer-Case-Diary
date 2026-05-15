# 📱 Android Integration Guide (Kotlin + Retrofit)

This guide provides the elite architectural pattern for connecting your Android mobile application to the **Lawyer Case Diary** production backend.

---

## 🏗️ 1. Professional Retrofit Architecture

### Dependency Setup (`build.gradle.kts`)
```kotlin
dependencies {
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.9.1")
}
```

### The "Elite" Network Module
This setup handles **Authentication**, **Idempotency**, and **Production Headers** automatically.

```kotlin
object ApiClient {
    private const val BASE_URL = "https://your-production-api.com/api/"
    private var token: String? = null

    fun setToken(newToken: String) { token = newToken }

    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor { chain ->
            val requestBuilder = chain.request().newBuilder()
            
            // 1. Production Security Headers
            requestBuilder.addHeader("Accept", "application/json")
            
            // 2. Automated Auth Injection
            token?.let {
                requestBuilder.addHeader("Authorization", "Bearer $it")
            }

            // 3. Automated Idempotency for POST/PUT
            if (chain.request().method == "POST" || chain.request().method == "PUT") {
                requestBuilder.addHeader("Idempotency-Key", java.util.UUID.randomUUID().toString())
            }

            chain.proceed(requestBuilder.build())
        }
        .addInterceptor(HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        })
        .build()

    val service: LawyerApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(LawyerApiService::class.java)
    }
}
```

---

## 📡 2. The Master API Interface

```kotlin
interface LawyerApiService {
    
    // --- AUTHENTICATION ---
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<ApiResponse<AuthData>>

    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<ApiResponse<AuthData>>

    @POST("auth/logout")
    suspend fun logout(): Response<ApiResponse<Unit>>

    // --- CORE DIARY ---
    @GET("stats")
    suspend fun getStats(): Response<ApiResponse<StatsData>>

    @GET("cases")
    suspend fun getCases(): Response<ApiResponse<List<CaseRecord>>>

    @POST("cases")
    suspend fun createCase(@Body case: CaseRequest): Response<ApiResponse<CaseRecord>>

    @GET("clients")
    suspend fun getClients(): Response<ApiResponse<List<ClientRecord>>>

    @GET("hearings")
    suspend fun getHearings(): Response<ApiResponse<List<HearingRecord>>>

    @POST("hearings")
    suspend fun createHearing(@Body hearing: HearingRequest): Response<ApiResponse<HearingRecord>>

    // --- PRIVACY & SETTINGS ---
    @GET("me/export")
    suspend fun exportData(): Response<ApiResponse<Any>>

    @GET("health")
    suspend fun checkHealth(): Response<HealthStatus>
}
```

---

## ⚠️ 3. Standardized Error Handling
Use this pattern in your ViewModels to handle production status codes correctly.

```kotlin
suspend fun <T> safeApiCall(apiCall: suspend () -> Response<T>): Result<T> {
    return try {
        val response = apiCall()
        when (response.code()) {
            200, 201 -> Result.success(response.body()!!)
            401 -> Result.failure(Exception("Session Expired. Please login again."))
            403 -> Result.failure(Exception("Access Denied. Admin clearance required."))
            429 -> Result.failure(Exception("Too many requests. Please wait 60 seconds."))
            500, 503 -> Result.failure(Exception("Legal Core is offline. Try again later."))
            else -> Result.failure(Exception("Error: ${response.message()}"))
        }
    } catch (e: Exception) {
        Result.failure(e)
    }
}
```

---

## 🚀 4. Implementation Example: Creating a Hearing

```kotlin
fun enrollHearing(caseId: String, date: String) {
    viewModelScope.launch {
        val request = HearingRequest(caseId = caseId, hearingDate = date, notes = "Mobile Enrollment")
        val result = safeApiCall { ApiClient.service.createHearing(request) }
        
        result.onSuccess { 
            showToast("Hearing successfully enrolled!") 
        }.onFailure { error ->
            showErrorDialog(error.message)
        }
    }
}
```

### 🔐 Security Note:
*   **SSL Pinning**: For absolute production security, implement SSL pinning in the `OkHttpClient` to prevent man-in-the-middle attacks.
*   **Token Persistence**: Store the `JWT` token in **EncryptedSharedPreferences** or **DataStore** with encryption—never store it in plain text.
