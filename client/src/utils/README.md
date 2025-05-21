# Utility Functions

This directory contains utility functions that are used across the application.

## `format-currency.ts`

Contains functions for formatting prices consistently:

- `formatCurrency(amount)` - Format a number as a currency (EUR)
- `centsToEuros(cents)` - Convert cents to euros
- `formatCentsAsCurrency(cents)` - Format cents as currency

Used by the invoice system to ensure consistent display of prices in PDF invoices and web UI.