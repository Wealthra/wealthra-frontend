<template>
  <div class="admin-user-management-table-c">
    <table class="user-table">
      <thead>
        <tr>
          <th>{{ selectedLanguage == 'English' ? 'User' : 'Kullanıcı' }}</th>
          <th>Email</th>
          <th>{{ selectedLanguage == 'English' ? 'Registration Date' : 'Kayıt Tarihi' }}</th>
          <th>{{ selectedLanguage == 'English' ? 'Net Worth' : 'Net Servet' }}</th>
          <th>{{ selectedLanguage == 'English' ? 'Actions' : 'Aksiyonlar' }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(user, index) in data" :key="index">
          <td>{{ user.firstName }} {{ user.lastName }}</td>
          <td>{{ user.email }}</td>
          <td>{{ formatDate(user.createdAt) }}</td>
          <td>${{ formatNumber(user.totalNetWorth) }}</td>
          <td>
            <button class="delete-btn" @click="deleteUser(user.id)">
              <font-awesome-icon :icon="actionIcons.delete" />
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <div class="pagination">
      <button
        :disabled="pageNumber === 1"
        @click="changePage(pageNumber - 1)"
        class="pagination-btn"
      >
        <font-awesome-icon :icon="arrowIcons.left" class="arrow-left" />
      </button>

      <span
        v-for="page in displayedPages"
        :key="page"
        :class="['page-number', { active: page === pageNumber }]"
        @click="changePage(page)"
      >
        {{ page }}
      </span>

      <span v-if="showEllipsis" class="ellipsis">...</span>

      <span
        v-if="showLastPage"
        :class="['page-number', { active: totalPages === pageNumber }]"
        @click="changePage(totalPages)"
      >
        {{ totalPages }}
      </span>

      <button
        :disabled="pageNumber === totalPages || totalPages === 0"
        @click="changePage(pageNumber + 1)"
        class="pagination-btn"
      >
        <font-awesome-icon :icon="arrowIcons.right" class="arrow-right" />
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { arrowIcons, actionIcons } from '@/icons/fontawesome-icons'

export default {
  name: 'AdminUserManagementTable',
  props: {
    pageNumber: {
      type: Number,
      required: true,
    },
    pageSize: {
      type: Number,
      required: true,
    },
    data: {
      type: Array as () => Array<{
        id: string
        firstName: string
        lastName: string
        email: string
        createdAt: string
        totalNetWorth: number
      }>,
      required: true,
    },
    hasMoreItems: {
      type: Boolean,
      required: true,
    },
    totalCount: {
      type: Number,
      required: true,
    },
    totalPages: {
      type: Number,
      required: true,
    },
    selectedLanguage: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      arrowIcons,
      actionIcons,
    }
  },
  computed: {
    displayedPages() {
      // Display up to 5 page numbers around the current page
      const maxVisiblePages = 5
      const halfVisible = Math.floor(maxVisiblePages / 2)

      let startPage = Math.max(1, this.pageNumber - halfVisible)
      const endPage = Math.min(startPage + maxVisiblePages - 1, this.totalPages)

      // Adjust start page if we're near the end
      if (this.totalPages - endPage < halfVisible) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1)
      }

      const pages = []
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }

      return pages
    },
    showEllipsis() {
      return (
        this.displayedPages.length > 0 &&
        this.displayedPages[this.displayedPages.length - 1] < this.totalPages - 1
      )
    },
    showLastPage() {
      return (
        this.displayedPages.length > 0 &&
        this.displayedPages[this.displayedPages.length - 1] < this.totalPages
      )
    },
  },
  methods: {
    formatDate(dateString: string) {
      try {
        const date = new Date(dateString)
        if (this.selectedLanguage === 'Turkish') {
          return date.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
        }
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      } catch {
        return dateString
      }
    },
    formatNumber(value: number) {
      return value.toLocaleString('en-US')
    },
    deleteUser(id: string) {
      this.$emit('deleteUser', id)
    },
    changePage(pageNumber: number) {
      if (pageNumber >= 1 && pageNumber <= this.totalPages) {
        this.$emit('changePage', pageNumber)
      }
    },
  },
}
</script>

<style scoped lang="scss">
.admin-user-management-table-c {
  width: 100%;
  margin: 1rem 0;
  border-radius: var(--border-radius);
  overflow: hidden;
  border: 1px solid var(--border-color);

  .user-table {
    width: 100%;
    border-collapse: collapse;

    th,
    td {
      padding: 12px 15px;
      text-align: left;
      border-bottom: 1px solid var(--border-color);
      color: var(--header-text-color);
    }

    thead {
      background-color: var(--background-color-soft);
      color: var(--header-text-color);
    }
  }

  .delete-btn {
    background: none;
    border: none;

    img {
      width: 20px;
      height: 20px;
      cursor: pointer;

      &:hover {
        scale: 1.1;
        transition: scale 0.2s ease-in-out;
      }
    }
  }

  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 15px 0;
    gap: 1rem;

    .pagination-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      background-color: var(--background-color-soft);
      border: 1px solid var(--border-color);
      border-radius: 4px;
      cursor: pointer;

      &:disabled {
        opacity: 0.4;
        cursor: default;
      }

      .arrow-left {
        transform: rotate(180deg);
        width: 16px;
        height: 16px;
      }

      .arrow-right {
        width: 16px;
        height: 16px;
      }
    }

    .page-number {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      border-radius: 4px;
      cursor: pointer;
      border: 1px solid var(--border-color);

      &.active {
        background-color: var(--primary-green-color);
        border: transparent;
        color: white;
      }

      &:hover:not(.active) {
        background-color: var(--background-color-soft);
      }
    }

    .ellipsis {
      padding: 0 8px;
    }
  }
}
@media (max-width: 768px) {
  .admin-user-management-table-c {
    margin: 0.5rem 0;
    border-radius: var(--border-radius);

    .user-table {
      display: block;
      overflow-x: auto;
      white-space: nowrap;
      -webkit-overflow-scrolling: touch;

      th,
      td {
        padding: 8px 10px;
        font-size: 0.85rem;
      }
    }

    .pagination {
      padding: 10px 0;
      gap: 0.5rem;
      flex-wrap: wrap;

      .pagination-btn {
        width: 35px;
        height: 35px;

        .arrow-left,
        .arrow-right {
          width: 14px;
          height: 14px;
        }
      }

      .page-number {
        width: 35px;
        height: 35px;
        font-size: 0.9rem;
      }

      .ellipsis {
        padding: 0 4px;
      }
    }
  }
}
</style>
