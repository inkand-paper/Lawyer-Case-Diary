package com.inkandpaper.lawyerdiary.api

import com.inkandpaper.lawyerdiary.models.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<ApiResponse<LoginResponse>>

    @POST("auth/refresh")
    suspend fun refresh(@Header("Authorization") refreshToken: String): Response<ApiResponse<LoginResponse>>

    @GET("cases")
    suspend fun getCases(
        @Query("limit") limit: Int = 50,
        @Query("offset") offset: Int = 0
    ): Response<ApiResponse<List<Case>>>

    @POST("cases")
    suspend fun createCase(@Body request: CreateCaseRequest): Response<ApiResponse<Case>>

    @GET("clients")
    suspend fun getClients(
        @Query("limit") limit: Int = 100,
        @Query("offset") offset: Int = 0
    ): Response<ApiResponse<List<Client>>>
}

data class ApiResponse<T>(
    val success: Boolean,
    val message: String,
    val data: T
)
