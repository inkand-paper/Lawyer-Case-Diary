package com.inkandpaper.lawyerdiary.models

data class LoginRequest(
    val email: String,
    val password: String
)

data class LoginResponse(
    val token: String,
    val refreshToken: String,
    val user: User
)

data class User(
    val id: String,
    val name: String,
    val email: String,
    val role: String,
    val plan: String
)

data class Case(
    val id: String,
    val title: String,
    val caseNumber: String,
    val courtName: String,
    val status: String,
    val createdAt: String,
    val client: Client? = null
)

data class CreateCaseRequest(
    val title: String,
    val caseNumber: String,
    val courtName: String,
    val clientId: String
)

data class Client(
    val id: String,
    val name: String,
    val email: String,
    val phone: String?
)
