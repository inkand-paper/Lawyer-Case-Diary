package com.inkandpaper.lawyerdiary.repository

import com.inkandpaper.lawyerdiary.api.ApiService
import com.inkandpaper.lawyerdiary.models.Case
import com.inkandpaper.lawyerdiary.models.CreateCaseRequest

class CaseRepository(private val apiService: ApiService) {
    suspend fun getCases(limit: Int = 50, offset: Int = 0): Result<List<Case>> {
        return try {
            val response = apiService.getCases(limit, offset)
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()!!.data)
            } else {
                Result.failure(Exception(response.body()?.message ?: "Failed to fetch cases"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun createCase(title: String, caseNumber: String, courtName: String, clientId: String): Result<Case> {
        return try {
            val request = CreateCaseRequest(title, caseNumber, courtName, clientId)
            val response = apiService.createCase(request)
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()!!.data)
            } else {
                Result.failure(Exception(response.body()?.message ?: "Failed to create case"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
