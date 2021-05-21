﻿using System;
using System.Collections.Generic;
using System.Linq;

namespace Grand.Domain
{
    /// <summary>
    /// Paged list
    /// </summary>
    /// <typeparam name="T">T</typeparam>
    [Serializable]
    public partial class PagedList<T> : List<T>, IPagedList<T>
    {

        private void Initialize(IEnumerable<T> source, int pageIndex, int pageSize, int? totalCount = null)
        {
            if (source == null)
                throw new ArgumentNullException(nameof(source));

            if (pageSize <= 0)
                pageSize = 1;

            TotalCount = totalCount ?? source.Count();

            if (pageSize > 0)
            {
                TotalPages = TotalCount / pageSize;
                if (TotalCount % pageSize > 0)
                    TotalPages++;
            }

            PageSize = pageSize;
            PageIndex = pageIndex;
            source = totalCount == null ? source.Skip(pageIndex * pageSize).Take(pageSize) : source;
            AddRange(source);
        }

        public PagedList()
        {
        }
        public PagedList(IEnumerable<T> source, int pageIndex, int pageSize)
        {
            Initialize(source, pageIndex, pageSize);
        }

        public PagedList(IEnumerable<T> source, int pageIndex, int pageSize, int totalCount)
        {
            Initialize(source, pageIndex, pageSize, totalCount);
        }

        public int PageIndex { get; private set; }
        public int PageSize { get; private set; }
        public int TotalCount { get; private set; }
        public int TotalPages { get; private set; }

        public bool HasPreviousPage {
            get { return (PageIndex > 0); }
        }
        public bool HasNextPage {
            get { return (PageIndex + 1 < TotalPages); }
        }
    }
}
