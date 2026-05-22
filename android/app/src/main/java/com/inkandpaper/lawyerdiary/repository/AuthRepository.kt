package com.inkandpaper.lawyerdiary.repository

import com.inkandpaper.lawyerdiary.api.ApiService
import com.inkandpaper.lawyerdiary.auth.SessionManager
import com.inkandpaper.lawyerdiary.models.LoginRequest
import kotlinx.coroutines.flow.first

class AuthRepository(
    private val apiService: ApiService,
    private val sessionManager: SessionManager
) {
    suspend fun login(email: String, password: String): Result<String> {
        return try {
            val response = apiService.login(LoginRequest(email, password))
            if (response.isSuccessful && response.body()?.success == true) {
                val data = response.body()!!.data
                sessionManager.saveSession(
                    accessToken = data.token,
                    refreshToken = data.refreshToken,
                    name = data.user.name
                )
                Result.success("Login Successful")
            } else {
                Result.failure(Exception(response.body()?.message ?: "Authentication Failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun logout() {
        sessionManager.clearSession()
    }

    suspend fun isLoggedIn(): Boolean {
        return sessionManager.accessToken.first() != null
    }
}
