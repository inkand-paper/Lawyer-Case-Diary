package com.inkandpaper.lawyerdiary.ui.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.inkandpaper.lawyerdiary.models.Case
import com.inkandpaper.lawyerdiary.repository.CaseRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed class DashboardUiState {
    object Loading : DashboardUiState()
    data class Success(val cases: List<Case>) : DashboardUiState()
    data class Error(val message: String) : DashboardUiState()
}

class DashboardViewModel(private val repository: CaseRepository) : ViewModel() {
    private val _uiState = MutableStateFlow<DashboardUiState>(DashboardUiState.Loading)
    val uiState: StateFlow<DashboardUiState> = _uiState

    init {
        loadCases()
    }

    fun loadCases() {
        viewModelScope.launch {
            _uiState.value = DashboardUiState.Loading
            repository.getCases()
                .onSuccess { cases -> _uiState.value = DashboardUiState.Success(cases) }
                .onFailure { error -> _uiState.value = DashboardUiState.Error(error.message ?: "Unknown Error") }
        }
    }
}
