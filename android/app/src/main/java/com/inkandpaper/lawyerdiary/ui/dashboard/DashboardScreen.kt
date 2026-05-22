package com.inkandpaper.lawyerdiary.ui.dashboard

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.inkandpaper.lawyerdiary.models.Case

@Composable
fun DashboardScreen(viewModel: DashboardViewModel) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            SmallTopAppBar(title = { Text("Lawyer Case Diary") })
        }
    ) { padding ->
        Box(modifier = Modifier.padding(padding).fillMaxSize()) {
            when (val state = uiState) {
                is DashboardUiState.Loading -> {
                    CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
                }
                is DashboardUiState.Success -> {
                    CaseList(cases = state.cases)
                }
                is DashboardUiState.Error -> {
                    Text(
                        text = state.message,
                        color = MaterialTheme.colorScheme.error,
                        modifier = Modifier.align(Alignment.Center)
                    )
                }
            }
        }
    }
}

@Composable
fun CaseList(cases: List<Case>) {
    LazyColumn(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        items(cases) { legalCase ->
            CaseItem(legalCase)
            Spacer(modifier = Modifier.height(8.dp))
        }
    }
}

@Composable
fun CaseItem(legalCase: Case) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = legalCase.title, style = MaterialTheme.typography.titleMedium)
            Text(text = "Case No: ${legalCase.caseNumber}", style = MaterialTheme.typography.bodySmall)
            Text(text = "Court: ${legalCase.courtName}", style = MaterialTheme.typography.bodySmall)
            
            Badge(
                containerColor = if (legalCase.status == "ACTIVE") 
                    MaterialTheme.colorScheme.primaryContainer 
                else MaterialTheme.colorScheme.secondaryContainer,
                modifier = Modifier.align(Alignment.End)
            ) {
                Text(legalCase.status)
            }
        }
    }
}
