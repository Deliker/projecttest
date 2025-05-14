<template>
  <div class="calendar-page">
    <transition name="fade-in" appear>
      <div class="calendar-container">
        <div class="calendar-header">
          <div class="calendar-header-left">
            <h2 class="calendar-title">{{ $t('calendar.title') }}</h2>
            <div class="calendar-subtitle">{{ $t('calendar.subtitle') }}</div>
          </div>
          <button class="btn add-task-btn" @click="openTaskModal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="add-icon">
              <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>{{ $t('calendar.addTask') }}</span>
          </button>
        </div>

        <div class="calendar-toolbar">
          <div class="month-selector">
            <button @click="previousMonth" class="month-nav-btn" aria-label="Previous month">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="current-month-container">
              <transition name="month-change" mode="out-in">
                <span :key="selectedMonth + '-' + selectedYear" class="current-month">
                  {{ months[selectedMonth] }}
                </span>
              </transition>
              <select v-model="selectedYear" class="year-select">
                <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
              </select>
            </div>
            <button @click="nextMonth" class="month-nav-btn" aria-label="Next month">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>

          <div class="calendar-filters">
            <div class="filter-dropdown">
              <button class="filter-btn" @click="toggleFilterDropdown">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>{{ $t('calendar.filter') }}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" :class="{ 'rotate-icon': showFilterDropdown }">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <transition name="dropdown-fade">
                <div class="dropdown-menu" v-if="showFilterDropdown">
                  <div class="dropdown-section">
                    <div class="dropdown-section-title">{{ $t('calendar.categories') }}</div>
                    <div class="filter-options categories">
                      <label class="checkbox-label" v-for="category in taskCategories" :key="category.id">
                        <input type="checkbox" v-model="selectedFilters.categories" :value="category.id" />
                        <span class="checkbox-custom" :style="{ '--category-color': category.color }"></span>
                        <span>{{ $t(`calendar.categoryNames.${category.id}`) }}</span>
                      </label>
                    </div>
                  </div>
                  <div class="dropdown-section">
                    <div class="dropdown-section-title">{{ $t('calendar.priority') }}</div>
                    <div class="filter-options priorities">
                      <label class="checkbox-label">
                        <input type="checkbox" v-model="selectedFilters.priorities" value="high" />
                        <span class="checkbox-custom" style="--category-color: #ff4444;"></span>
                        <span>{{ $t('calendar.high') }}</span>
                      </label>
                      <label class="checkbox-label">
                        <input type="checkbox" v-model="selectedFilters.priorities" value="medium" />
                        <span class="checkbox-custom" style="--category-color: #ffbb33;"></span>
                        <span>{{ $t('calendar.medium') }}</span>
                      </label>
                      <label class="checkbox-label">
                        <input type="checkbox" v-model="selectedFilters.priorities" value="low" />
                        <span class="checkbox-custom" style="--category-color: #00C851;"></span>
                        <span>{{ $t('calendar.low') }}</span>
                      </label>
                    </div>
                  </div>
                  <button class="clear-filters" @click="clearFilters">{{ $t('calendar.clearFilters') }}</button>
                </div>
              </transition>
            </div>

            <div class="search-box">
              <input
                  type="text"
                  :placeholder="$t('calendar.searchTasks')"
                  v-model="searchQuery"
                  class="search-input"
              />
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="search-icon">
                <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        <div class="weekday-labels">
          <div v-for="day in weekdays" :key="day" class="weekday-label">{{ $t(`calendar.weekdays.${day.toLowerCase()}`) }}</div>
        </div>

        <div class="calendar-grid-wrapper">
          <transition-group name="calendar-change" tag="div" class="calendar-grid">
            <div
                v-for="element in calendarDays"
                :key="`${selectedMonth}-${selectedYear}-${element.id}`"
                :class="['calendar-day', {
                'empty-day': !element.number,
                'has-tasks': tasksCount(element.number) > 0,
                'today': isToday(element.number),
                'weekend': isWeekend(element.number),
                'drop-target': isDragTarget(element.number)
              }]"
                @click="element.number && openTaskListModal(element.number)"
                @dragover.prevent="onDragOver($event, element.number)"
                @dragleave.prevent="onDragLeave($event, element.number)"
                @drop="onDrop($event, element.number)"
            >
              <div v-if="element.number" class="day-content">
                <div class="day-number">{{ element.number }}</div>
                <transition-group name="task-indicators-change" tag="div" class="task-indicators" v-if="tasksCount(element.number) > 0">
                  <div
                      v-for="task in getDayTasks(element.number).slice(0, 3)"
                      :key="task.id"
                      class="task-indicator"
                      :class="[`priority-${task.priority}`, {'has-timer': task.duration > 0}]"
                      :style="{ backgroundColor: task.categoryColor }"
                      :title="task.description"
                      :draggable="true"
                      @dragstart="onDragStart($event, task, element.number)"
                      @dragend="onDragEnd"
                  ></div>
                  <div v-if="tasksCount(element.number) > 3" :key="'more-' + element.number" class="task-indicator more-indicator">
                    +{{ tasksCount(element.number) - 3 }}
                  </div>
                </transition-group>
              </div>
            </div>
          </transition-group>
        </div>
      </div>
    </transition>

    <transition name="modal-fade">
      <div v-if="showModal" class="modal" @click.self="closeTaskModal">
        <div class="modal-content">
          <button class="close-btn" @click="closeTaskModal" aria-label="Close modal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <h3 class="modal-title">{{ $t('calendar.modal.addTask') }}</h3>
          <div class="form-group">
            <label for="task-date">{{ $t('calendar.modal.date') }}</label>
            <div class="date-picker">
              <select id="task-year" v-model="selectedYear" class="form-control date-select">
                <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
              </select>
              <select id="task-month" v-model="selectedMonth" class="form-control date-select">
                <option v-for="(month, index) in months" :key="index" :value="index">{{ month }}</option>
              </select>
              <select id="task-day" v-model="selectedDay" class="form-control date-select">
                <option v-for="day in daysInMonth" :key="day" :value="day">{{ day }}</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label for="task-input">{{ $t('calendar.modal.taskDescription') }}</label>
            <input type="text" id="task-input" v-model="newTask" class="form-control"
                   :placeholder="$t('calendar.modal.whatToDo')" @keyup.enter="addTask" />
          </div>
          <div class="form-group">
            <label for="task-duration">{{ $t('calendar.modal.taskDuration') }}</label>
            <div class="duration-selector">
              <div class="duration-input">
                <input type="number" id="task-duration-weeks" v-model="taskDurationWeeks" class="form-control duration-field" min="0" max="52" />
                <span class="duration-label">{{ $t('calendar.modal.weeks') }}</span>
              </div>
              <div class="duration-input">
                <input type="number" id="task-duration-days" v-model="taskDurationDays" class="form-control duration-field" min="0" max="6" />
                <span class="duration-label">{{ $t('calendar.modal.days') }}</span>
              </div>
              <div class="duration-input">
                <input type="number" id="task-duration-hours" v-model="taskDurationHours" class="form-control duration-field" min="0" max="23" />
                <span class="duration-label">{{ $t('calendar.modal.hours') }}</span>
              </div>
              <div class="duration-input">
                <input type="number" id="task-duration-minutes" v-model="taskDurationMinutes" class="form-control duration-field" min="0" max="59" step="5" />
                <span class="duration-label">{{ $t('calendar.modal.minutes') }}</span>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label for="task-priority">{{ $t('calendar.priority') }}:</label>
            <div class="priority-selector">
              <button
                  v-for="priority in ['low', 'medium', 'high']"
                  :key="priority"
                  type="button"
                  class="priority-btn"
                  :class="[priority, { active: taskPriority === priority }]"
                  @click="taskPriority = priority"
              >
                {{ $t(`calendar.${priority}`) }}
              </button>
            </div>
          </div>
          <div class="form-group">
            <label>{{ $t('calendar.modal.category') }}</label>
            <div class="category-selector">
              <div v-for="category in taskCategories"
                   :key="category.id"
                   :class="['category-option', { active: selectedCategory === category.id }]"
                   :style="{ color: category.color }"
                   @click="selectedCategory = category.id">
                <div class="category-color" :style="{ backgroundColor: category.color }"></div>
                <span>{{ $t(`calendar.categoryNames.${category.id}`) }}</span>
              </div>
            </div>
          </div>
          <button class="btn save-task" @click="addTask">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            {{ $t('calendar.modal.saveTask') }}
          </button>
        </div>
      </div>
    </transition>

    <transition name="modal-slide">
      <div v-if="showTaskListModal" class="modal task-list-modal" @click.self="closeTaskListModal">
        <div class="modal-content">
          <button class="close-btn" @click="closeTaskListModal" aria-label="Close modal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <h3 class="modal-title">
            <span class="date-display">{{ selectedMonthName }} {{ selectedDay }}, {{ selectedYear }}</span>
            <button class="add-task-inline" @click="openAddTaskForSelectedDay" aria-label="Add task for this day">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </h3>

          <div v-if="filteredTasksForSelectedDay.length === 0" class="no-tasks">
            <div class="no-tasks-icon">📋</div>
            <p>{{ $t('calendar.modal.noTasks') }}</p>
            <button class="btn add-task-empty" @click="openAddTaskForSelectedDay">{{ $t('calendar.addTask') }}</button>
          </div>

          <div v-else class="tasks-container">
            <transition-group name="task-list" tag="div" class="tasks-list">
              <div
                  v-for="(element, index) in filteredTasksForSelectedDay"
                  :key="element.id"
                  class="task-item"
                  :class="[`priority-${element.priority}`, {'active-timer': element.timerActive}]"
                  draggable="true"
                  @dragstart="onDragStart($event, element, selectedDay)"
              >
                <div class="task-drag-handle" title="Перетащите для перемещения">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 9H16M8 15H16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </div>
                <div class="task-category-indicator"
                     :style="{ backgroundColor: element.categoryColor }">
                </div>
                <div class="task-content">
                  <div class="task-text">{{ element.description }}</div>
                  <div class="task-meta">
                    <span class="task-category" :style="{ backgroundColor: `${element.categoryColor}20`, color: element.categoryColor }">
                      {{ $t(`calendar.categoryNames.${element.category}`) }}
                    </span>
                    <span class="task-priority" :class="`priority-badge-${element.priority}`">{{ $t(`calendar.${element.priority}`) }}</span>

                    <span v-if="element.duration > 0" class="task-duration">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                        <polyline points="12 6 12 12 16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      {{ formatDuration(element.duration) }}
                    </span>

                    <button v-if="element.duration > 0"
                            @click.stop="toggleTimer(element)"
                            class="timer-toggle-btn"
                            :class="{ 'timer-active': element.timerActive }">
                      <svg v-if="!element.timerActive" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <polygon points="5 3 19 12 5 21" fill="currentColor"/>
                      </svg>
                      <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="6" y="4" width="4" height="16" fill="currentColor"/>
                        <rect x="14" y="4" width="4" height="16" fill="currentColor"/>
                      </svg>
                    </button>

                    <span v-if="element.timerActive" class="timer-countdown">
                      {{ formatTimeRemaining(element.timeRemaining) }}
                    </span>
                  </div>
                </div>
                <div class="task-actions">
                  <button class="task-action-btn edit" @click="editTask(element, index)" title="Редактировать">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                  <button class="task-action-btn delete" @click="deleteTask(index)" title="Удалить">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                  <button class="task-action-btn complete" @click="finishSpecificTask(index)" title="Завершить">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </transition-group>
          </div>
        </div>
      </div>
    </transition>

    <transition name="modal-slide-right">
      <div v-if="showEditModal" class="modal" @click.self="closeEditModal">
        <div class="modal-content">
          <button class="close-btn" @click="closeEditModal" aria-label="Close modal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <h3 class="modal-title">{{ $t('calendar.modal.editTask') }}</h3>
          <div class="form-group">
            <label for="edit-task-date">{{ $t('calendar.modal.date') }}</label>
            <div class="date-picker">
              <select id="edit-task-year" v-model="editTaskData.year" class="form-control date-select">
                <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
              </select>
              <select id="edit-task-month" v-model="editTaskData.month" class="form-control date-select">
                <option v-for="(month, index) in months" :key="index" :value="index">{{ month }}</option>
              </select>
              <select id="edit-task-day" v-model="editTaskData.day" class="form-control date-select">
                <option v-for="day in editDaysInMonth" :key="day" :value="day">{{ day }}</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label for="edit-task-input">{{ $t('calendar.modal.taskDescription') }}</label>
            <input type="text" id="edit-task-input" v-model="editTaskData.description" class="form-control"
                   :placeholder="$t('calendar.modal.whatToDo')" />
          </div>
          <div class="form-group">
            <label for="edit-task-duration">{{ $t('calendar.modal.taskDuration') }}</label>
            <div class="duration-selector">
              <div class="duration-input">
                <input type="number" id="edit-task-duration-weeks" v-model="editTaskData.durationWeeks" class="form-control duration-field" min="0" max="52" />
                <span class="duration-label">{{ $t('calendar.modal.weeks') }}</span>
              </div>
              <div class="duration-input">
                <input type="number" id="edit-task-duration-days" v-model="editTaskData.durationDays" class="form-control duration-field" min="0" max="6" />
                <span class="duration-label">{{ $t('calendar.modal.days') }}</span>
              </div>
              <div class="duration-input">
                <input type="number" id="edit-task-duration-hours" v-model="editTaskData.durationHours" class="form-control duration-field" min="0" max="23" />
                <span class="duration-label">{{ $t('calendar.modal.hours') }}</span>
              </div>
              <div class="duration-input">
                <input type="number" id="edit-task-duration-minutes" v-model="editTaskData.durationMinutes" class="form-control duration-field" min="0" max="59" step="5" />
                <span class="duration-label">{{ $t('calendar.modal.minutes') }}</span>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label>{{ $t('calendar.priority') }}:</label>
            <div class="priority-selector">
              <button
                  v-for="priority in ['low', 'medium', 'high']"
                  :key="priority"
                  type="button"
                  class="priority-btn"
                  :class="[priority, { active: editTaskData.priority === priority }]"
                  @click="editTaskData.priority = priority"
              >
                {{ $t(`calendar.${priority}`) }}
              </button>
            </div>
          </div>
          <div class="form-group">
            <label>{{ $t('calendar.modal.category') }}</label>
            <div class="category-selector">
              <div v-for="category in taskCategories"
                   :key="category.id"
                   :class="['category-option', { active: editTaskData.category === category.id }]"
                   :style="{ color: category.color }"
                   @click="editTaskData.category = category.id">
                <div class="category-color" :style="{ backgroundColor: category.color }"></div>
                <span>{{ $t(`calendar.categoryNames.${category.id}`) }}</span>
              </div>
            </div>
          </div>
          <button class="btn save-task" @click="saveEditedTask">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            {{ $t('calendar.modal.saveChanges') }}
          </button>
        </div>
      </div>
    </transition>

    <transition name="notification-slide">
      <div v-if="showNotification" class="achievement-notification">
        <div class="achievement-notification-content">
          <div class="achievement-icon">🏆</div>
          <div class="achievement-text">
            <div class="achievement-title">{{ $t('calendar.achievements.unlocked') }}</div>
            <div class="achievement-description">{{ notificationMessage }}</div>
          </div>
          <button @click="showNotification = false" class="notification-close" aria-label="Close notification">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="achievement-progress">
          <div class="progress-bar" :style="{ width: notificationProgress + '%' }"></div>
        </div>
      </div>
    </transition>

    <transition name="notification-slide">
      <div v-if="showTimerNotification" class="timer-notification">
        <div class="timer-notification-content">
          <div class="timer-notification-icon">⏰</div>
          <div class="timer-notification-text">
            <div class="timer-notification-title">{{ $t('calendar.timer.expired') }}</div>
            <div class="timer-notification-description">{{ timerNotificationMessage }}</div></div>
          <button @click="closeTimerNotification" class="notification-close" aria-label="Close notification">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </transition>

    <div v-if="isDragging" class="drag-preview" :style="dragPreviewStyle">
      <div class="drag-preview-content">
        <div class="drag-preview-indicator" :style="{ backgroundColor: draggedTask?.categoryColor }"></div>
        <div class="drag-preview-text">{{ draggedTask?.description }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { useI18n } from 'vue-i18n';
import apiService from '../services/api'; // Import the API service directly

export default {
  name: 'CalendarPage',
  setup() {
    const i18n = useI18n();
    return { i18n };
  },
  data() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentDay = currentDate.getDate();

    const years = [];
    for (let i = -5; i <= 10; i++) {
      years.push(currentYear + i);
    }

    return {
      selectedMonth: currentMonth,
      selectedDay: currentDay,
      selectedYear: currentYear,
      availableYears: years,
      tasks: {},
      showModal: false,
      showTaskListModal: false,
      showEditModal: false,
      showFilterDropdown: false,
      newTask: '',
      taskPriority: 'medium',
      selectedCategory: 'work',
      taskDurationWeeks: 0,
      taskDurationDays: 0,
      taskDurationHours: 0,
      taskDurationMinutes: 0,
      timers: {},
      showTimerNotification: false,
      timerNotificationMessage: '',
      taskCategories: [
        { id: 'work', name: 'Work', color: '#4CAF50' },
        { id: 'personal', name: 'Personal', color: '#2196F3' },
        { id: 'study', name: 'Study', color: '#9C27B0' },
        { id: 'health', name: 'Health', color: '#F44336' },
        { id: 'shopping', name: 'Shopping', color: '#FF9800' },
        { id: 'other', name: 'Other', color: '#757575' }
      ],
      editTaskData: {
        id: null,
        description: '',
        priority: 'medium',
        category: 'work',
        year: currentYear,
        month: 0,
        day: 1,
        index: -1,
        durationWeeks: 0,
        durationDays: 0,
        durationHours: 0,
        durationMinutes: 0
      },
      draggedTask: null,
      dragSourceDay: null,
      dragSourceYear: null,
      dragSourceMonth: null,
      isDragging: false,
      mouseX: 0,
      mouseY: 0,
      dragTargetDay: null,
      searchQuery: '',
      selectedFilters: {
        categories: [],
        priorities: []
      },
      showNotification: false,
      notificationMessage: '',
      notificationProgress: 100,
      notificationTimer: null,
      isLoading: false,
      loadingError: null,
      months: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ],
      weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    };
  },

  watch: {
    selectedMonth() {
      this.$nextTick(() => {
        this.updateDayAttributes();
      });
      this.loadTasksForMonth();
    },
    selectedYear() {
      this.$nextTick(() => {
        this.updateDayAttributes();
      });
      this.loadTasksForMonth();
    },
    // Watch for changes to tasks and save to localStorage
    tasks: {
      deep: true
    }
  },

  computed: {
    daysInMonth() {
      return new Date(this.selectedYear, this.selectedMonth + 1, 0).getDate();
    },
    editDaysInMonth() {
      return new Date(this.editTaskData.year, this.editTaskData.month + 1, 0).getDate();
    },
    selectedMonthName() {
      return this.months[this.selectedMonth];
    },
    calendarDays() {
      const days = [];
      const firstDay = new Date(this.selectedYear, this.selectedMonth, 1).getDay();
      const offset = firstDay === 0 ? 6 : firstDay - 1;

      for (let i = 0; i < offset; i++) {
        days.push({ number: 0, id: `empty-${i}` });
      }

      for (let i = 1; i <= this.daysInMonth; i++) {
        days.push({ number: i, id: `day-${i}` });
      }

      return days;
    },
    filteredTasksForSelectedDay() {
      return this.getDayTasks(this.selectedDay);
    },
    dragPreviewStyle() {
      return {
        left: `${this.mouseX + 15}px`,
        top: `${this.mouseY + 15}px`,
      };
    }
  },

  methods: {
    // Load tasks for the current month from the backend
    async loadTasksForMonth() {
      this.isLoading = true;
      this.loadingError = null;

      try {
        const userId = localStorage.getItem('user_id');

        // First, load tasks from localStorage (these will be shown immediately)
        this.loadTasksFromLocalStorage();

        // If no user ID, we'll just use the localStorage data
        if (!userId) {
          console.log('No user ID found, using localStorage tasks only');
          this.isLoading = false;
          return;
        }

        let response;
        try {
          // Then try to fetch from server to get the latest
          response = await apiService.getTasksForMonth(userId, this.selectedYear, this.selectedMonth);
        } catch (apiError) {
          console.error('API error when fetching tasks:', apiError);
          this.loadingError = 'Failed to connect to server. Using locally stored tasks.';
          this.isLoading = false;
          return;
        }

        // Parse response data safely
        let tasksFromServer = [];
        try {
          tasksFromServer = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
          // Ensure tasksFromServer is an array
          if (!Array.isArray(tasksFromServer)) {
            console.error('Expected array of tasks but got:', tasksFromServer);
            tasksFromServer = [];
          }
        } catch (parseError) {
          console.error('Failed to parse tasks response:', parseError);
          this.loadingError = 'Failed to process data from server. Using locally stored tasks.';
          tasksFromServer = [];
        }

        // Create a temporary object to store processed tasks
        const processedTasks = {};

        // Process each task from the server
        tasksFromServer.forEach(task => {
          // Validate task data
          if (!task || typeof task !== 'object' || !task.year || !task.month || !task.day) {
            console.warn('Invalid task data:', task);
            return;
          }

          const key = `${task.year}-${task.month}-${task.day}`;

          if (!processedTasks[key]) {
            processedTasks[key] = [];
          }

          // Add category color to each task
          const category = this.taskCategories.find(c => c.id === task.category);
          task.categoryColor = category ? category.color : '#757575';

          // If the task has a timer that was previously running, initialize it
          if (task.timerActive && task.timeRemaining !== null) {
            this.initializeTimer(task);
          }

          processedTasks[key].push(task);
        });

        // For each day in the processedTasks, sort tasks by priority
        Object.keys(processedTasks).forEach(key => {
          processedTasks[key].sort((a, b) => {
            const priorityOrder = { high: 1, medium: 2, low: 3 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          });
        });

        // Merge with existing tasks
        // We're selectively updating for the current month only to preserve tasks loaded from localStorage
        for (const key in processedTasks) {
          if (key.includes(`${this.selectedYear}-${this.selectedMonth}`)) {
            this.tasks[key] = processedTasks[key];
          }
        }

        // Save the merged tasks to localStorage
        this.saveTasksToLocalStorage();

      } catch (error) {
        console.error('Failed to load tasks for month:', error);
        this.loadingError = 'Failed to load tasks. Using locally stored tasks.';
      } finally {
        this.isLoading = false;
      }
    },

    // Initialize timer for a task
    initializeTimer(task) {
      if (!task.timeRemaining || task.timeRemaining <= 0) return;

      task.timerActive = true;

      this.timers[task.id] = setInterval(() => {
        if (task.timeRemaining <= 0) {
          clearInterval(this.timers[task.id]);
          delete this.timers[task.id];
          task.timerActive = false;
          task.timeRemaining = 0;

          this.showTimerExpiredNotification(task);
          this.saveTaskToDatabase(task);
        } else {
          task.timeRemaining--;

          // Save state to database every minute to avoid too many requests
          if (task.timeRemaining % 60 === 0) {
            this.saveTaskToDatabase(task);
          }
        }
      }, 1000);
    },

    // Save task updates to the database
    async saveTaskToDatabase(task) {
      if (!task || !task.id) {
        console.error('Invalid task data, cannot save to database:', task);
        return false;
      }

      // Skip API calls for local-only tasks
      if (task.id.toString().startsWith('local_') || task.isLocalOnly) {
        console.log('Skipping database save for local-only task:', task.id);
        // Even though we're not saving to DB, save to localStorage
        this.saveTasksToLocalStorage();
        return true; // Return true to prevent further error handling
      }

      try {
        await apiService.updateTask(task.id, task);
        console.log('Task updated in database:', task.id);
        // Save to localStorage as well
        this.saveTasksToLocalStorage();
        return true;
      } catch (error) {
        console.error('Failed to update task in database:', error);
        // Even though DB update failed, save to localStorage
        this.saveTasksToLocalStorage();
        return false;
      }
    },

    previousMonth() {
      if (this.selectedMonth > 0) {
        this.selectedMonth -= 1;
      } else {
        if (this.selectedYear > this.availableYears[0]) {
          this.selectedMonth = 11;
          this.selectedYear -= 1;
        }
      }
    },

    nextMonth() {
      if (this.selectedMonth < 11) {
        this.selectedMonth += 1;
      } else {
        if (this.selectedYear < this.availableYears[this.availableYears.length - 1]) {
          this.selectedMonth = 0;
          this.selectedYear += 1;
        }
      }
    },

    isToday(day) {
      const today = new Date();
      return day === today.getDate() &&
          this.selectedMonth === today.getMonth() &&
          this.selectedYear === today.getFullYear();
    },

    isWeekend(day) {
      if (!day) return false;
      const date = new Date(this.selectedYear, this.selectedMonth, day);
      const dayOfWeek = date.getDay();
      return dayOfWeek === 0 || dayOfWeek === 6;
    },

    isDragTarget(day) {
      return this.isDragging && this.dragTargetDay === day;
    },

    openTaskModal() {
      const today = new Date();
      this.selectedDay = today.getDate();
      this.selectedMonth = today.getMonth();
      this.selectedYear = today.getFullYear();
      this.showModal = true;
    },

    closeTaskModal() {
      this.showModal = false;
      this.resetModalForm();
    },

    resetModalForm() {
      this.newTask = '';
      this.taskPriority = 'medium';
      this.selectedCategory = 'work';
      this.taskDurationWeeks = 0;
      this.taskDurationDays = 0;
      this.taskDurationHours = 0;
      this.taskDurationMinutes = 0;
    },

    openTaskListModal(day) {
      this.selectedDay = day;
      this.showTaskListModal = true;
    },

    closeTaskListModal() {
      this.showTaskListModal = false;
    },

    openAddTaskForSelectedDay() {
      this.closeTaskListModal();
      this.openTaskModal();
    },

    toggleFilterDropdown() {
      this.showFilterDropdown = !this.showFilterDropdown;
    },

    clearFilters() {
      this.selectedFilters.categories = [];
      this.selectedFilters.priorities = [];
      this.searchQuery = '';
      this.showFilterDropdown = false;
    },

    getCategoryColor(categoryId) {
      const category = this.taskCategories.find(c => c.id === categoryId);
      return category ? category.color : '#757575';
    },

    getCategoryName(categoryId) {
      const category = this.taskCategories.find(c => c.id === categoryId);
      return category ? category.name : 'Other';
    },

    getDayTasks(day) {
      const key = `${this.selectedYear}-${this.selectedMonth}-${day}`;
      if (!this.tasks[key]) return [];

      return this.tasks[key].filter(task => {
        if (this.searchQuery && !task.description.toLowerCase().includes(this.searchQuery.toLowerCase())) {
          return false;
        }

        if (this.selectedFilters.categories.length > 0 && !this.selectedFilters.categories.includes(task.category)) {
          return false;
        }

        if (this.selectedFilters.priorities.length > 0 && !this.selectedFilters.priorities.includes(task.priority)) {
          return false;
        }

        return true;
      });
    },

    tasksCount(day) {
      const filteredTasks = this.getDayTasks(day);
      return filteredTasks.length;
    },

    formatDuration(durationMinutes) {
      if (!durationMinutes || durationMinutes <= 0) return '';

      const weeks = Math.floor(durationMinutes / (7 * 24 * 60));
      const days = Math.floor((durationMinutes % (7 * 24 * 60)) / (24 * 60));
      const hours = Math.floor((durationMinutes % (24 * 60)) / 60);
      const minutes = durationMinutes % 60;

      let formatted = '';

      if (weeks > 0) {
        formatted += `${weeks}w `;
      }

      if (days > 0) {
        formatted += `${days}d `;
      }

      if (hours > 0) {
        formatted += `${hours}h `;
      }

      if (minutes > 0) {
        formatted += `${minutes}m`;
      }

      return formatted.trim();
    },

    formatTimeRemaining(timeRemainingSeconds) {
      if (!timeRemainingSeconds || timeRemainingSeconds <= 0) return '00:00';

      const weeks = Math.floor(timeRemainingSeconds / (7 * 24 * 3600));
      const days = Math.floor((timeRemainingSeconds % (7 * 24 * 3600)) / (24 * 3600));
      const hours = Math.floor((timeRemainingSeconds % (24 * 3600)) / 3600);
      const minutes = Math.floor((timeRemainingSeconds % 3600) / 60);
      const seconds = Math.floor(timeRemainingSeconds % 60);

      let formatted = '';

      if (weeks > 0) {
        formatted += `${weeks}w `;
      }

      if (days > 0) {
        formatted += `${days}d `;
      }

      if (weeks > 0 || days > 0 || hours > 0) {
        formatted += `${hours.toString().padStart(2, '0')}:`;
      }

      formatted += `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      return formatted;
    },

    toggleTimer(task) {
      const taskId = task.id;

      if (task.timerActive) {
        if (this.timers[taskId]) {
          clearInterval(this.timers[taskId]);
          delete this.timers[taskId];
        }
        task.timerActive = false;
        this.saveTaskToDatabase(task);
        return;
      }

      if (!task.timeRemaining && task.timeRemaining !== 0) {
        task.timeRemaining = task.duration * 60;
      }

      task.timerActive = true;

      this.timers[taskId] = setInterval(() => {
        if (task.timeRemaining <= 0) {
          clearInterval(this.timers[taskId]);
          delete this.timers[taskId];
          task.timerActive = false;
          task.timeRemaining = 0;

          const timerCompletedEvent = new CustomEvent('timer-completed', {
            detail: task
          });
          document.dispatchEvent(timerCompletedEvent);

          this.showTimerExpiredNotification(task);
          this.saveTaskToDatabase(task);
        } else {
          task.timeRemaining--;

          if (task.timeRemaining % 60 === 0) {
            this.saveTaskToDatabase(task);
          }
        }
      }, 1000);

      this.saveTaskToDatabase(task);
    },

    showTimerExpiredNotification(task) {
      this.timerNotificationMessage = `"${task.description}" - ${this.$t('calendar.timer.timeOver')}`;
      this.showTimerNotification = true;

      setTimeout(() => {
        this.closeTimerNotification();
      }, 5000);
    },

    closeTimerNotification() {
      this.showTimerNotification = false;
      this.timerNotificationMessage = '';
    },

    playAddAnimation() {
      const dayElement = document.querySelector(`.calendar-day[data-day="${this.selectedDay}"]`);
      if (dayElement) {
        dayElement.classList.add('task-added-pulse');
        setTimeout(() => {
          dayElement.classList.remove('task-added-pulse');
        }, 1000);
      }
    },
    async addTask() {
      // Basic validation
      if (!this.newTask.trim()) {
        const inputElement = document.getElementById('task-input');
        if (inputElement) {
          inputElement.classList.add('error-shake');
          setTimeout(() => {
            inputElement.classList.remove('error-shake');
          }, 500);
        }
        alert('Please enter a task description.');
        return;
      }

      if (this.selectedYear !== null && this.selectedMonth !== null && this.selectedDay !== null) {
        try {
          const userId = localStorage.getItem('user_id');
          if (!userId) {
            console.error('No user ID found in localStorage');
            alert('Please log in to create tasks');
            return;
          }

          // Prepare task data for the API
          const taskData = {
            description: this.newTask.trim(),
            priority: this.taskPriority,
            category: this.selectedCategory,
            year: this.selectedYear,
            month: this.selectedMonth,
            day: this.selectedDay,
            duration: (
                (parseInt(this.taskDurationWeeks) || 0) * 7 * 24 * 60 +
                (parseInt(this.taskDurationDays) || 0) * 24 * 60 +
                (parseInt(this.taskDurationHours) || 0) * 60 +
                (parseInt(this.taskDurationMinutes) || 0)
            )
          };

          console.log('Sending task data:', taskData);

          let response;
          let createdTask;
          let isLocalOnly = false;

          try {
            // Send task to backend
            response = await apiService.createTask(taskData, userId);
            console.log('Server response:', response);

            // Try to parse the response data safely
            try {
              if (typeof response.data === 'string') {
                // Fix malformed JSON if necessary - specifically the "user": issue
                let responseText = response.data;
                if (responseText.includes('"user":}')) {
                  responseText = responseText.replace('"user":}', '"user":null}');
                }
                createdTask = JSON.parse(responseText);
              } else {
                createdTask = response.data;
              }

              // Validate the created task has required fields
              if (!createdTask || !createdTask.id) {
                throw new Error('Invalid task data returned from server');
              }
            } catch (parseError) {
              console.error('Failed to parse response data:', parseError);
              throw parseError; // Re-throw to be caught by the outer catch
            }
          } catch (apiError) {
            console.error('API error when creating task:', apiError);
            isLocalOnly = true;

            // Create a fallback task with a temporary ID
            createdTask = {
              id: 'local_' + Date.now(),
              description: taskData.description,
              priority: taskData.priority,
              category: taskData.category,
              year: taskData.year,
              month: taskData.month,
              day: taskData.day,
              duration: taskData.duration,
              timeRemaining: taskData.duration > 0 ? taskData.duration * 60 : null,
              timerActive: false,
              isLocalOnly: true // Flag to indicate this is a local-only task
            };

            console.log('Created local-only task:', createdTask);
          }

          // Add to local state
          const key = `${this.selectedYear}-${this.selectedMonth}-${this.selectedDay}`;
          if (!this.tasks[key]) {
            this.tasks[key] = [];
          }

          // Add category color
          const category = this.taskCategories.find(c => c.id === this.selectedCategory);
          createdTask.categoryColor = category.color;

          this.tasks[key].push(createdTask);

          // Save to localStorage
          this.saveTasksToLocalStorage();

          // Emit the task-created event
          const taskCreatedEvent = new CustomEvent('task-created', {
            detail: createdTask
          });
          document.dispatchEvent(taskCreatedEvent);

          // Sort tasks by priority
          this.tasks[key].sort((a, b) => {
            const priorityOrder = {high: 1, medium: 2, low: 3};
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          });

          this.closeTaskModal();

          // Add visual feedback
          this.playAddAnimation();

          if (isLocalOnly) {
            alert('Task was saved locally but could not be saved to the server. It will persist across page reloads but may need to be synced later.');
          }
        } catch (error) {
          console.error('Failed to create task:', error);
          alert('Failed to create task. Please try again.');
        }
      } else {
        alert('Please select a year, month, and a day.');
      }
    },

    // Add these localStorage methods
    saveTasksToLocalStorage() {
      try {
        localStorage.setItem('calendar_tasks', JSON.stringify(this.tasks));
        console.log('Tasks saved to localStorage');
      } catch (error) {
        console.error('Failed to save tasks to localStorage:', error);
      }
    },

    loadTasksFromLocalStorage() {
      try {
        const savedTasks = localStorage.getItem('calendar_tasks');
        if (savedTasks) {
          const parsedTasks = JSON.parse(savedTasks);

          // Process the loaded tasks to add category colors and initialize timers
          Object.keys(parsedTasks).forEach(key => {
            parsedTasks[key].forEach(task => {
              // Add category color to each task
              const category = this.taskCategories.find(c => c.id === task.category);
              task.categoryColor = category ? category.color : '#757575';

              // If the task has a timer that was previously running, initialize it
              if (task.timerActive && task.timeRemaining !== null) {
                this.initializeTimer(task);
              }
            });

            // Sort tasks by priority
            parsedTasks[key].sort((a, b) => {
              const priorityOrder = { high: 1, medium: 2, low: 3 };
              return priorityOrder[a.priority] - priorityOrder[b.priority];
            });
          });

          // Update the tasks object with the parsed tasks
          this.tasks = parsedTasks;
          console.log('Tasks loaded from localStorage');
        }
      } catch (error) {
        console.error('Failed to load tasks from localStorage:', error);
      }
    },

    async deleteTask(index) {
      if (confirm(this.$t('calendar.modal.confirmDelete'))) {
        const key = `${this.selectedYear}-${this.selectedMonth}-${this.selectedDay}`;

        // Verify that filteredTasksForSelectedDay has the index
        if (index >= this.filteredTasksForSelectedDay.length) {
          console.error('Invalid task index:', index);
          alert('Could not delete task: Invalid task index');
          return;
        }

        const taskId = this.filteredTasksForSelectedDay[index].id;
        const actualIndex = this.tasks[key].findIndex(task => task.id === taskId);

        if (actualIndex !== -1) {
          try {
            const task = this.tasks[key][actualIndex];
            console.log('Attempting to delete task with ID:', task.id);

            // Stop timer if active
            if (task.timerActive && this.timers[task.id]) {
              clearInterval(this.timers[task.id]);
              delete this.timers[task.id];
            }

            // Check if this is a local-only task (has a local_ prefix or isLocalOnly flag)
            const isLocalTask = task.id.toString().startsWith('local_') || task.isLocalOnly;

            if (!isLocalTask) {
              try {
                // Only try to delete from backend if it's not a local-only task
                const userId = localStorage.getItem('user_id');
                if (!userId) {
                  console.error('No user ID found in localStorage');
                  alert('Please log in to delete tasks');
                  return;
                }

                // Make the API call with both taskId and userId
                console.log('Calling deleteTask API with taskId:', task.id, 'and userId:', userId);
                await apiService.deleteTask(task.id, userId);
                console.log('Task deleted successfully from backend');
              } catch (apiError) {
                console.error('API error when deleting task:', apiError);
                console.error('Error details:', apiError.response ? apiError.response.data : 'No response data');
                console.log('Continuing with UI update despite API error');
              }
            } else {
              console.log('Skipping API call for local-only task');
            }

            // Always delete from UI
            const taskElement = document.querySelector(`.task-item:nth-child(${index + 1})`);
            if (taskElement) {
              taskElement.classList.add('deleting');

              setTimeout(() => {
                this.tasks[key].splice(actualIndex, 1);

                if (this.tasks[key].length === 0) {
                  delete this.tasks[key];
                  this.closeTaskListModal();
                }

                // Save changes to localStorage
                this.saveTasksToLocalStorage();
              }, 300);
            } else {
              this.tasks[key].splice(actualIndex, 1);

              if (this.tasks[key].length === 0) {
                delete this.tasks[key];
                this.closeTaskListModal();
              }

              // Save changes to localStorage
              this.saveTasksToLocalStorage();
            }
          } catch (error) {
            console.error('Failed to delete task:', error);
            alert('Failed to delete task. Please try again.');
          }
        } else {
          console.error('Task not found in local state:', taskId);
          alert('Could not find task to delete. Please refresh the page and try again.');
        }
      }
    },

    async finishSpecificTask(index) {
      const key = `${this.selectedYear}-${this.selectedMonth}-${this.selectedDay}`;

      // Validate that tasks for this key exist
      if (!this.tasks[key]) {
        console.error('No tasks found for date:', key);
        alert('Could not complete task: No tasks found for this date');
        return;
      }

      // Validate index is within range
      if (index >= this.filteredTasksForSelectedDay.length) {
        console.error('Invalid task index:', index);
        alert('Could not complete task: Invalid task index');
        return;
      }

      const taskId = this.filteredTasksForSelectedDay[index].id;
      const actualIndex = this.tasks[key].findIndex(task => task.id === taskId);

      if (actualIndex !== -1) {
        try {
          const task = this.tasks[key][actualIndex];
          const userId = localStorage.getItem('user_id');

          if (!userId) {
            console.error('No user ID found in localStorage');
            alert('Please log in to complete tasks');
            return;
          }

          // Stop timer if active
          if (task.timerActive && this.timers[task.id]) {
            clearInterval(this.timers[task.id]);
            delete this.timers[task.id];
          }

          // Check if this is a local-only task
          const isLocalTask = task.id.toString().startsWith('local_') || task.isLocalOnly;

          if (!isLocalTask) {
            try {
              // Only try to complete on backend if it's not a local-only task
              console.log('Sending completeTask request with task ID:', task.id, 'and user ID:', userId);
              const response = await apiService.completeTask(task.id, userId);
              console.log('Task completed successfully on backend, response:', response);
            } catch (apiError) {
              console.error('API error when completing task:', apiError);
              console.error('Error details:', apiError.response ? apiError.response.data : 'No response data');
              console.log('Continuing with UI update despite API error');
            }
          } else {
            console.log('Skipping API call for local-only task');
          }

          // Always update UI
          const taskElement = document.querySelector(`.task-item:nth-child(${index + 1})`);
          if (taskElement) {
            taskElement.classList.add('completing');

            setTimeout(() => {
              const completedTask = this.tasks[key].splice(actualIndex, 1)[0];

              const taskCompletedEvent = new CustomEvent('task-completed', {
                detail: completedTask
              });
              document.dispatchEvent(taskCompletedEvent);

              if (this.tasks[key].length === 0) {
                delete this.tasks[key];
                this.closeTaskListModal();
              }

              // Save changes to localStorage
              this.saveTasksToLocalStorage();

              this.showCompletionConfetti();
            }, 500);
          } else {
            const completedTask = this.tasks[key].splice(actualIndex, 1)[0];

            const taskCompletedEvent = new CustomEvent('task-completed', {
              detail: completedTask
            });
            document.dispatchEvent(taskCompletedEvent);

            if (this.tasks[key].length === 0) {
              delete this.tasks[key];
              this.closeTaskListModal();
            }

            // Save changes to localStorage
            this.saveTasksToLocalStorage();

            this.showCompletionConfetti();
          }
        } catch (error) {
          console.error('Failed to complete task:', error);
          alert('Failed to complete task. Please try again.');
        }
      } else {
        console.error('Task not found in local state:', taskId);
        alert('Could not find task to complete. Please refresh the page and try again.');
      }
    },

    showCompletionConfetti() {
      this.notificationMessage = "Task completed!";
      this.showNotification = true;
      this.notificationProgress = 100;

      this.notificationTimer = setInterval(() => {
        this.notificationProgress -= 2;
        if (this.notificationProgress <= 0) {
          clearInterval(this.notificationTimer);
          this.showNotification = false;
        }
      }, 50);

      setTimeout(() => {
        clearInterval(this.notificationTimer);
        this.showNotification = false;
      }, 3000);
    },

    async editTask(task) {
      const key = `${this.selectedYear}-${this.selectedMonth}-${this.selectedDay}`;
      const taskId = task.id;
      const actualIndex = this.tasks[key].findIndex(t => t.id === taskId);

      const totalMinutes = task.duration || 0;
      const durationWeeks = Math.floor(totalMinutes / (7 * 24 * 60));
      const durationDays = Math.floor((totalMinutes % (7 * 24 * 60)) / (24 * 60));
      const durationHours = Math.floor((totalMinutes % (24 * 60)) / 60);
      const durationMinutes = totalMinutes % 60;

      this.editTaskData = {
        id: task.id,
        description: task.description,
        priority: task.priority,
        category: task.category,
        year: this.selectedYear,
        month: this.selectedMonth,
        day: this.selectedDay,
        index: actualIndex,
        durationWeeks: durationWeeks,
        durationDays: durationDays,
        durationHours: durationHours,
        durationMinutes: durationMinutes
      };
      this.showEditModal = true;
    },

    closeEditModal() {
      this.showEditModal = false;
    },

    async saveEditedTask() {
      if (!this.editTaskData.description.trim()) {
        const inputElement = document.getElementById('edit-task-input');
        if (inputElement) {
          inputElement.classList.add('error-shake');
          setTimeout(() => {
            inputElement.classList.remove('error-shake');
          }, 500);
        }
        alert('Task description cannot be empty.');
        return;
      }

      const oldKey = `${this.selectedYear}-${this.selectedMonth}-${this.selectedDay}`;
      const newKey = `${this.editTaskData.year}-${this.editTaskData.month}-${this.editTaskData.day}`;

      const durationMinutes = (
          (parseInt(this.editTaskData.durationWeeks) || 0) * 7 * 24 * 60 +
          (parseInt(this.editTaskData.durationDays) || 0) * 24 * 60 +
          (parseInt(this.editTaskData.durationHours) || 0) * 60 +
          (parseInt(this.editTaskData.durationMinutes) || 0)
      );

      try {
        if (oldKey !== newKey) {
          if (!this.tasks[newKey]) {
            this.tasks[newKey] = [];
          }

          const taskToMove = this.tasks[oldKey][this.editTaskData.index];

          if (taskToMove.timerActive && this.timers[taskToMove.id]) {
            clearInterval(this.timers[taskToMove.id]);
            delete this.timers[taskToMove.id];
            taskToMove.timerActive = false;
          }

          // Update task properties
          taskToMove.description = this.editTaskData.description;
          taskToMove.priority = this.editTaskData.priority;
          taskToMove.category = this.editTaskData.category;
          taskToMove.year = this.editTaskData.year;
          taskToMove.month = this.editTaskData.month;
          taskToMove.day = this.editTaskData.day;
          taskToMove.duration = durationMinutes;

          if (taskToMove.timeRemaining !== null) {
            taskToMove.timeRemaining = durationMinutes * 60;
          }

          // Check if this is a local-only task
          const isLocalTask = taskToMove.id.toString().startsWith('local_') || taskToMove.isLocalOnly;

          if (!isLocalTask) {
            try {
              // Save changes to database
              await apiService.updateTask(taskToMove.id, taskToMove);
            } catch (apiError) {
              console.error('API error when updating task:', apiError);
              // Continue with UI update regardless of API errors
            }
          } else {
            console.log('Skipping API call for local-only task');
          }

          // Update local state
          this.tasks[oldKey].splice(this.editTaskData.index, 1);
          const category = this.taskCategories.find(c => c.id === this.editTaskData.category);
          taskToMove.categoryColor = category.color;

          this.tasks[newKey].push(taskToMove);
          this.tasks[newKey].sort((a, b) => {
            const priorityOrder = {high: 1, medium: 2, low: 3};
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          });

          if (this.tasks[oldKey].length === 0) {
            delete this.tasks[oldKey];
            this.closeTaskListModal();
          }
        } else {
          const task = this.tasks[oldKey][this.editTaskData.index];

          if (task.timerActive && this.timers[task.id]) {
            clearInterval(this.timers[task.id]);
            delete this.timers[task.id];
            task.timerActive = false;
          }

          // Update task properties
          task.description = this.editTaskData.description;
          task.priority = this.editTaskData.priority;
          task.category = this.editTaskData.category;
          task.duration = durationMinutes;

          if (task.timeRemaining !== null) {
            task.timeRemaining = durationMinutes * 60;
          }

          // Update category color
          const category = this.taskCategories.find(c => c.id === this.editTaskData.category);
          task.categoryColor = category.color;

          // Check if this is a local-only task
          const isLocalTask = task.id.toString().startsWith('local_') || task.isLocalOnly;

          if (!isLocalTask) {
            try {
              // Save changes to database
              await apiService.updateTask(task.id, task);
            } catch (apiError) {
              console.error('API error when updating task:', apiError);
              // Continue with UI update regardless of API errors
            }
          } else {
            console.log('Skipping API call for local-only task');
          }

          // Sort tasks by priority
          this.tasks[oldKey].sort((a, b) => {
            const priorityOrder = {high: 1, medium: 2, low: 3};
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          });
        }

        this.closeEditModal();
      } catch (error) {
        console.error('Failed to update task:', error);
        alert('Failed to update task. Please try again.');
      }
    },

    onDragStart(event, task, day) {
      event.dataTransfer.setData('taskId', task.id);
      event.dataTransfer.setData('sourceDay', day);
      event.dataTransfer.effectAllowed = 'move';

      const dragImage = document.createElement('div');
      dragImage.className = 'drag-ghost';
      dragImage.textContent = task.description;
      dragImage.style.backgroundColor = task.categoryColor + '20';
      dragImage.style.color = task.categoryColor;
      dragImage.style.padding = '8px';
      dragImage.style.borderRadius = '6px';
      dragImage.style.position = 'absolute';
      dragImage.style.top = '-1000px';
      document.body.appendChild(dragImage);

      event.dataTransfer.setDragImage(dragImage, 0, 0);

      setTimeout(() => {
        document.body.removeChild(dragImage);
      }, 0);

      this.draggedTask = task;
      this.dragSourceDay = day;
      this.dragSourceMonth = this.selectedMonth;
      this.dragSourceYear = this.selectedYear;

      this.isDragging = true;

      window.addEventListener('mousemove', this.trackMousePosition);
    },

    trackMousePosition(e) {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    },

    onDragOver(event, day) {
      event.preventDefault();
      if (day && day !== this.dragTargetDay) {
        this.dragTargetDay = day;
      }
    },

    onDragLeave(event, day) {
      event.preventDefault();
      if (this.dragTargetDay === day) {
        this.dragTargetDay = null;
      }
    },

    onDragEnd() {
      this.isDragging = false;
      this.draggedTask = null;
      this.dragSourceDay = null;
      this.dragSourceMonth = null;
      this.dragSourceYear = null;
      this.dragTargetDay = null;

      window.removeEventListener('mousemove', this.trackMousePosition);
    },

    async onDrop(event, targetDay) {
      event.preventDefault();
      const taskId = event.dataTransfer.getData('taskId');

      if (!taskId || !targetDay) {
        this.onDragEnd();
        return;
      }

      const sourceKey = `${this.dragSourceYear}-${this.dragSourceMonth}-${this.dragSourceDay}`;
      const targetKey = `${this.selectedYear}-${this.selectedMonth}-${targetDay}`;

      if (sourceKey === targetKey) {
        this.onDragEnd();
        return;
      }

      try {
        if (!this.tasks[targetKey]) {
          this.tasks[targetKey] = [];
        }

        const taskIndex = this.tasks[sourceKey].findIndex(t => t.id === this.draggedTask.id);

        if (taskIndex !== -1) {
          const task = this.tasks[sourceKey][taskIndex];

          // Stop timer if active
          if (task.timerActive && this.timers[task.id]) {
            clearInterval(this.timers[task.id]);
            delete this.timers[task.id];
            task.timerActive = false;
          }

          // Update task date in memory
          task.year = this.selectedYear;
          task.month = this.selectedMonth;
          task.day = targetDay;

          // Check if this is a local-only task
          const isLocalTask = task.id.toString().startsWith('local_') || task.isLocalOnly;

          if (!isLocalTask) {
            try {
              // Update task in database
              await apiService.updateTask(task.id, task);
            } catch (apiError) {
              console.error('API error when updating task:', apiError);
              // Continue with UI update regardless of API errors
            }
          } else {
            console.log('Skipping API call for local-only task during drag and drop');
          }

          const sourceElement = event.target.closest('.calendar-day');
          const targetElement = document.querySelector(`.calendar-day[data-day="${targetDay}"]`);

          if (sourceElement && targetElement) {
            sourceElement.classList.add('task-drag-source');
            targetElement.classList.add('task-drag-target');

            setTimeout(() => {
              sourceElement.classList.remove('task-drag-source');
              targetElement.classList.remove('task-drag-target');

              // Move task in local state
              const movedTask = this.tasks[sourceKey].splice(taskIndex, 1)[0];
              this.tasks[targetKey].push(movedTask);

              // Sort tasks by priority
              this.tasks[targetKey].sort((a, b) => {
                const priorityOrder = { high: 1, medium: 2, low: 3 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
              });

              // Clean up empty arrays
              if (this.tasks[sourceKey].length === 0) {
                delete this.tasks[sourceKey];
                this.closeTaskListModal();
              }
            }, 300);
          } else {
            // Move task in local state
            const movedTask = this.tasks[sourceKey].splice(taskIndex, 1)[0];
            this.tasks[targetKey].push(movedTask);

            // Sort tasks by priority
            this.tasks[targetKey].sort((a, b) => {
              const priorityOrder = { high: 1, medium: 2, low: 3 };
              return priorityOrder[a.priority] - priorityOrder[b.priority];
            });

            // Clean up empty arrays
            if (this.tasks[sourceKey].length === 0) {
              delete this.tasks[sourceKey];
              this.closeTaskListModal();
            }
          }
        }
      } catch (error) {
        console.error('Failed to move task:', error);
        alert('Failed to move task. Please try again.');
      }

      this.onDragEnd();
    },

    updateDayAttributes() {
      setTimeout(() => {
        const dayElements = document.querySelectorAll('.calendar-day:not(.empty-day)');
        dayElements.forEach(el => {
          const day = el.querySelector('.day-number');
          if (day) {
            el.setAttribute('data-day', day.textContent);
          }
        });
      }, 100);
    },

    handleOutsideClick(event) {
      const dropdown = document.querySelector('.filter-dropdown');
      if (dropdown && !dropdown.contains(event.target) && this.showFilterDropdown) {
        this.showFilterDropdown = false;
      }
    }
  },

  async mounted() {
    try {
      // First load from localStorage
      this.loadTasksFromLocalStorage();

      // Then load from server
      await this.loadTasksForMonth();
      this.updateDayAttributes();
    } catch (error) {
      console.error('Error initializing calendar page:', error);
    }

    document.addEventListener('click', this.handleOutsideClick);
    window.addEventListener('mousemove', this.trackMousePosition);
    window.addEventListener('mouseup', this.onDragEnd);

    // Listen for achievement-unlocked events
    document.addEventListener('achievement-unlocked', (event) => {
      const achievementData = event.detail;
      this.notificationMessage = `${achievementData.title} - ${achievementData.description}`;
      this.showNotification = true;
      this.notificationProgress = 100;

      if (this.notificationTimer) {
        clearInterval(this.notificationTimer);
      }

      this.notificationTimer = setInterval(() => {
        this.notificationProgress -= 1;
        if (this.notificationProgress <= 0) {
          clearInterval(this.notificationTimer);
          this.showNotification = false;
        }
      }, 50);

      setTimeout(() => {
        clearInterval(this.notificationTimer);
        this.showNotification = false;
      }, 5000);
    });
  },

  beforeUnmount() {
    document.removeEventListener('click', this.handleOutsideClick);
    window.removeEventListener('mousemove', this.trackMousePosition);
    window.removeEventListener('mouseup', this.onDragEnd);

    // Clear all active timers
    Object.keys(this.timers).forEach(timerId => {
      clearInterval(this.timers[timerId]);
    });

    if (this.notificationTimer) {
      clearInterval(this.notificationTimer);
    }
  }
};
</script>

<style scoped>
.calendar-page {
  width: 100%;
  min-height: 100vh;
  color: var(--color-text);
  padding: 2rem;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

.calendar-container {
  max-width: 1400px;
  margin: 0 auto;
  background-color: var(--color-card-bg);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
  transition: transform 0.5s ease, box-shadow 0.5s ease;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.calendar-header-left {
  flex: 1;
}

.calendar-title {
  font-size: 2.2rem;
  font-weight: 600;
  letter-spacing: 1px;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: fadeInUp 0.7s ease;
}

.calendar-subtitle {
  color: var(--color-text-secondary);
  font-size: 1rem;
  animation: fadeInUp 0.9s ease;
}

.add-task-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeInRight 1s ease;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

.add-task-btn:hover {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  transform: translateY(-3px);
  box-shadow: 0 7px 15px rgba(99, 102, 241, 0.3);
}

.add-icon {
  transition: transform 0.3s ease;
}

.add-task-btn:hover .add-icon {
  transform: rotate(90deg);
}

.calendar-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  background: var(--color-card-bg-hover);
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  animation: fadeIn 0.8s ease;
}

.month-selector {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.current-month-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
}

.current-month {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-text);
}

.year-select {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  background: transparent;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  text-align: center;
  appearance: none;
  margin-top: 0.25rem;
  outline: none;
  transition: color 0.3s ease;
}

.year-select:hover {
  color: var(--color-primary);
}

.month-nav-btn {
  background: transparent;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.month-nav-btn:hover {
  background: var(--color-card-bg-hover);
  color: var(--color-primary);
  transform: scale(1.1);
}

.calendar-filters {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.filter-dropdown {
  position: relative;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  background: var(--color-card-bg);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  background: var(--color-card-bg-hover);
  border-color: var(--color-primary-light);
  transform: translateY(-2px);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  width: 280px;
  background: var(--bg-gradient-start);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: var(--box-shadow);
  padding: 1.25rem;
  z-index: 50;
}

.dropdown-section {
  margin-bottom: 1.25rem;
}

.dropdown-section-title {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--color-text);
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: color 0.3s ease;
}

.checkbox-label:hover {
  color: var(--color-text);
}

.checkbox-label input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkbox-custom {
  height: 18px;
  width: 18px;
  border: 2px solid var(--color-border);
  border-radius: 6px;
  display: inline-block;
  position: relative;
  background: var(--color-card-bg);
  transition: all 0.3s ease;
}

.checkbox-custom::after {
  content: "";
  position: absolute;
  display: none;
  left: 5px;
  top: 1px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-label input:checked ~ .checkbox-custom {
  background-color: var(--category-color, var(--color-primary));
  border-color: var(--category-color, var(--color-primary));
  transform: scale(1.05);
}

.checkbox-label input:checked ~ .checkbox-custom::after {
  display: block;
}

.clear-filters {
  width: 100%;
  padding: 0.75rem;
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-filters:hover {
  color: var(--color-text);
  background: var(--color-card-bg-hover);
  border-color: var(--color-primary-light);
  transform: translateY(-2px);
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 300px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  color: var(--color-text);
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  background: var(--color-card-bg-hover);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
  transform: translateY(-2px);
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-secondary);
  transition: color 0.3s ease;
}

.search-box:focus-within .search-icon {
  color: var(--color-primary);
}

.weekday-labels {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  animation: fadeIn 1s ease;
}

.weekday-label {
  text-align: center;
  padding: 0.75rem 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.calendar-grid-wrapper {
  position: relative;
  min-height: 500px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.75rem;
  position: relative;
}

.calendar-day {
  aspect-ratio: 1/1;
  position: relative;
  background: var(--color-card-bg);
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  overflow: hidden;
  border: 1px solid var(--color-border);
  padding: 0.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.calendar-day:not(.empty-day):hover {
  background: var(--color-card-bg-hover);
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.empty-day {
  background: transparent;
  cursor: default;
  border: none;
  box-shadow: none;
}

.has-tasks {
  background: var(--color-card-bg-hover);
  border-color: var(--color-border);
}

.has-tasks:hover {
  background: var(--color-card-bg-hover);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.today {
  border: 2px solid var(--color-primary);
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.3);
}

.weekend {
  background: rgba(var(--color-primary-rgb), 0.05);
}

.day-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.day-number {
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: auto;
}

.today .day-number {
  color: var(--color-primary);
  font-weight: 700;
}

.task-indicators {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin-top: auto;
}

.task-indicator {
  height: 0.3rem;
  border-radius: 2rem;
  background: var(--color-primary);
  opacity: 0.9;
  transition: all 0.3s ease;
  position: relative;
}

.calendar-day:hover .task-indicator {
  height: 0.4rem;
  opacity: 1;
}

.task-indicator.priority-high {
  animation: pulse 2s infinite;
}

.task-indicator.has-timer::after {
  content: "";
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background-color: #fff;
  border-radius: 0 2rem 2rem 0;
  opacity: 0.7;
}

.more-indicator {
  background: var(--color-text-secondary);
  color: var(--color-text);
  font-size: 0.7rem;
  height: auto;
  padding: 0.1rem 0.3rem;
  text-align: center;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.calendar-day:hover .more-indicator {
  background: var(--color-primary);
  color: white;
  transform: scale(1.05);
}

.drop-target {
  background: rgba(var(--color-primary-rgb), 0.15) !important;
  border: 2px dashed var(--color-primary) !important;
  transform: scale(1.05);
  z-index: 5;
}

.task-drag-source {
  opacity: 0.5;
  transform: scale(0.95);
}

.task-drag-target {
  animation: highlight 1s ease;
}

@keyframes highlight {
  0% {
    background: rgba(var(--color-primary-rgb), 0.3);
  }
  100% {
    background: var(--color-card-bg-hover);
  }
}

.drag-preview {
  position: fixed;
  z-index: 9999;
  pointer-events: none;
  width: 200px;
  transition: top 0.1s, left 0.1s;
}

.drag-preview-content {
  background: var(--color-card-bg);
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  border: 1px solid var(--color-primary);
  position: relative;
  max-width: 200px;
  display: flex;
  gap: 8px;
  align-items: center;
  opacity: 0.9;
}

.drag-preview-indicator {
  width: 5px;
  height: 100%;
  border-radius: 3px;
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
}

.drag-preview-text {
  margin-left: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
  color: var(--color-text);
}

.task-list-modal .modal-content {
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.tasks-container {
  margin-top: 1.5rem;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  max-height: 50vh;
  padding-right: 0.5rem;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.task-item {
  display: flex;
  align-items: center;
  padding: 1.25rem;
  background: var(--color-card-bg);
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  border: 1px solid var(--color-border);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.task-item.active-timer {
  background: linear-gradient(90deg, rgba(var(--color-primary-rgb), 0.1) 0%, var(--color-card-bg) 100%);
  border-color: var(--color-primary);
  box-shadow: 0 0 15px rgba(var(--color-primary-rgb), 0.2);
}

.task-item:hover {
  background: var(--color-card-bg-hover);
  transform: translateY(-3px) translateX(5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.task-category-indicator {
  position: absolute;
  left: 0;
  top: 0;
  width: 5px;
  height: 100%;
  border-radius: 0 4px 4px 0;
}

.task-drag-handle {
  cursor: grab;
  padding: 0.5rem;
  color: var(--color-text-secondary);
  margin-left: -0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.task-item:hover .task-drag-handle {
  color: var(--color-text);
  transform: translateY(-2px);
}

.task-content {
  flex: 1;
  margin: 0 0.75rem;
  overflow: hidden;
}

.task-text {
  font-size: 1rem;
  margin-bottom: 0.75rem;
  word-break: break-word;
  color: var(--color-text);
  transition: all 0.3s ease;
}

.task-item:hover .task-text {
  transform: translateY(-2px);
}

.task-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  font-size: 0.8rem;
  transition: all 0.3s ease;
}

.task-item:hover .task-meta {
  transform: translateY(-2px);
}

.task-category {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.task-item:hover .task-category {
  padding: 0.25rem 0.85rem;
}

.task-priority {
  text-transform: uppercase;
  font-size: 0.7rem;
  letter-spacing: 0.5px;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.task-duration {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
  transition: all 0.3s ease;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.timer-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.timer-toggle-btn:hover {
  background: var(--color-primary);
  color: white;
  transform: scale(1.1);
}

.timer-toggle-btn.timer-active {
  background: rgba(255, 68, 68, 0.1);
  color: #ff4444;
}

.timer-toggle-btn.timer-active:hover {
  background: #ff4444;
  color: white;
}

.timer-countdown {
  font-size: 0.8rem;
  font-family: monospace;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
  animation: pulse-timer 1s infinite alternate;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@keyframes pulse-timer {
  from {
    opacity: 0.8;
  }
  to {
    opacity: 1;
  }
}

.priority-badge-high {
  background-color: rgba(255, 68, 68, 0.2);
  color: #ff4444;
}

.priority-badge-medium {
  background-color: rgba(255, 187, 51, 0.2);
  color: #ffbb33;
}

.priority-badge-low {
  background-color: rgba(0, 200, 81, 0.2);
  color: #00C851;
}

.priority-high {
  border-left: 3px solid #ff4444;
}

.priority-medium {
  border-left: 3px solid #ffbb33;
}

.priority-low {
  border-left: 3px solid #00C851;
}

.task-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  opacity: 0.6;
}

.task-item:hover .task-actions {
  opacity: 1;
}

.task-action-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.task-action-btn:hover {
  background: var(--color-card-bg);
  color: var(--color-text);
  transform: translateY(-3px);
}

.task-action-btn.edit:hover {
  border-color: #2196F3;
  color: #2196F3;
  background-color: rgba(33, 150, 243, 0.1);
}

.task-action-btn.delete:hover {
  border-color: #ff4444;
  color: #ff4444;
  background-color: rgba(255, 68, 68, 0.1);
}

.task-action-btn.complete:hover {
  border-color: #00C851;
  color: #00C851;
  background-color: rgba(0, 200, 81, 0.1);
}

.no-tasks {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: var(--color-text-secondary);
}

.no-tasks-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.5;
  animation: float 3s ease infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.no-tasks p {
  margin-bottom: 1.5rem;
  font-size: 1rem;
}

.add-task-empty {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

.add-task-empty:hover {
  background: var(--color-primary-dark);
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
}

.deleting {
  animation: delete-animation 0.3s forwards;
}

.completing {
  animation: complete-animation 0.5s forwards;
}

@keyframes delete-animation {
  0% {
    transform: translateX(0);
    opacity: 1;
  }
  100% {
    transform: translateX(30px);
    opacity: 0;
  }
}

@keyframes complete-animation {
  0% {
    transform: translateX(0);
    opacity: 1;
  }
  50% {
    transform: translateX(10px);
    opacity: 0.8;
    background-color: rgba(0, 200, 81, 0.2);
  }
  100% {
    transform: translateX(50px);
    opacity: 0;
    background-color: rgba(0, 200, 81, 0.4);
  }
}

.error-shake {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
  border-color: #ff4444 !important;
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-5px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(5px);
  }
}

.task-added-pulse {
  animation: pulse-border 0.8s;
}

@keyframes pulse-border {
  0% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(99, 102, 241, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
  }
}

.timer-notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.25rem;
  z-index: 100;
  width: 320px;
  border: 1px solid #FF4444;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2), 0 0 15px rgba(255, 68, 68, 0.3);
  animation: notification-in 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.timer-notification-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
}

.timer-notification-icon {
  font-size: 2.25rem;
  animation: shake 1.2s ease;
}

.timer-notification-text {
  flex: 1;
}

.timer-notification-title {
  font-size: 0.85rem;
  color: #FF4444;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 0.35rem;
  font-weight: 600;
}

.timer-notification-description {
  font-size: 1rem;
  color: var(--color-text);
}

@keyframes notification-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.date-picker {
  display: flex;
  gap: 0.5rem;
}

.date-select {
  flex: 1;
}

.duration-selector {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.duration-input {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 60px;
}

.duration-field {
  width: 100%;
  text-align: center;
  padding: 0.5rem;
}

.duration-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  text-align: center;
  margin-top: 0.25rem;
}

.priority-selector {
  display: flex;
  gap: 0.75rem;
}

.priority-btn {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-card-bg);
  color: var(--color-text);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.priority-btn::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 5px;
  transition: all 0.3s ease;
}

.priority-btn.low::before {
  background-color: #00C851;
}

.priority-btn.medium::before {
  background-color: #ffbb33;
}

.priority-btn.high::before {
  background-color: #ff4444;
}

.priority-btn:hover {
  background: var(--color-card-bg-hover);
  transform: translateY(-3px);
}

.priority-btn.active {
  background: var(--color-card-bg-hover);
  border-color: var(--color-primary);
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.priority-btn.active.low {
  border-color: #00C851;
  color: #00C851;
}

.priority-btn.active.medium {
  border-color: #ffbb33;
  color: #ffbb33;
}

.priority-btn.active.high {
  border-color: #ff4444;
  color: #ff4444;
}

.category-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 0.75rem;
}

.category-option {
  padding: 0.75rem;
  border-radius: 10px;
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  overflow: hidden;
  position: relative;
}

.category-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: var(--color-primary);
  transition: all 0.3s ease;
}

.category-option:hover {
  background: var(--color-card-bg-hover);
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.category-option:hover .category-color {
  transform: scale(1.2);
}

.category-option.active {
  background: var(--color-card-bg-hover);
  border-color: currentColor;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.category-option.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 5px;
  background-color: currentColor;
}

@media (max-width: 1280px) {
  .calendar-container {
    padding: 1.5rem;
  }

  .calendar-title {
    font-size: 2rem;
  }
}

@media (max-width: 1024px) {
  .calendar-page {
    padding: 1.5rem;
  }

  .calendar-grid {
    gap: 0.5rem;
  }

  .day-number {
    font-size: 1rem;
  }
}

@media (max-width: 768px) {
  .calendar-page {
    padding: 1rem;
  }

  .calendar-container {
    padding: 1rem;
  }

  .calendar-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .calendar-title {
    font-size: 1.75rem;
  }

  .add-task-btn {
    width: 100%;
  }

  .calendar-toolbar {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .month-selector {
    width: 100%;
    justify-content: space-between;
  }

  .calendar-filters {
    width: 100%;
    justify-content: space-between;
  }

  .search-box {
    max-width: none;
    width: 100%;
  }

  .category-selector {
    grid-template-columns: repeat(2, 1fr);
  }

  .modal-content {
    padding: 1.5rem;
    width: 95%;
  }

  .duration-selector {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .duration-input {
    min-width: 45%;
    margin-bottom: 0.5rem;
  }
}

@media (max-width: 640px) {
  .weekday-label {
    font-size: 0.7rem;
    padding: 0.5rem 0;
  }

  .calendar-day {
    padding: 0.25rem;
  }

  .day-number {
    font-size: 0.85rem;
  }

  .task-actions {
    flex-direction: column;
    gap: 0.35rem;
  }

  .date-picker {
    flex-direction: column;
  }

  .priority-selector {
    flex-direction: column;
  }

  .task-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.35rem;
  }
}

@media (max-width: 480px) {
  .calendar-header-left {
    width: 100%;
    text-align: center;
  }

  .month-selector {
    justify-content: center;
  }

  .calendar-filters {
    flex-direction: column;
    gap: 0.75rem;
  }

  .filter-dropdown, .search-box {
    width: 100%;
  }

  .filter-btn {
    width: 100%;
    justify-content: center;
  }

  .timer-notification {
    left: 1rem;
    right: 1rem;
    width: auto;
  }

  .duration-input {
    min-width: 45%;
  }

  .task-duration, .timer-countdown {
    max-width: 120px;
  }
}
</style>