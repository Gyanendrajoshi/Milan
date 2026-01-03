import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scroll, Wrench, Package, BarChart3, ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col h-full bg-slate-50/50 p-0">
      <Card className="flex-1 flex flex-col border-0 shadow-none rounded-none overflow-hidden">
        <CardHeader className="bg-theme-gradient-r px-6 py-4 rounded-none shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-white mb-1">Dashboard</CardTitle>
              <p className="flex items-center gap-2 text-sm text-blue-100">
                <Sparkles className="h-4 w-4 text-yellow-300" />
                Welcome to ERP Packaging Management System
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-6">

          {/* Quick Stats */}
          <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/90">Total Rolls</CardTitle>
                <div className="rounded-full bg-white/20 p-2 backdrop-blur-sm">
                  <Scroll className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">2</div>
                <p className="text-xs text-white/80">Active roll items</p>
              </CardContent>
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
            </Card>

            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/90">Total Tools</CardTitle>
                <div className="rounded-full bg-white/20 p-2 backdrop-blur-sm">
                  <Wrench className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">2</div>
                <p className="text-xs text-white/80">Active tool items</p>
              </CardContent>
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
            </Card>

            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-green-500 to-green-600 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/90">Inventory</CardTitle>
                <div className="rounded-full bg-white/20 p-2 backdrop-blur-sm">
                  <Package className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">4</div>
                <p className="text-xs text-white/80">Total items</p>
              </CardContent>
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
            </Card>

            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/90">Analytics</CardTitle>
                <div className="rounded-full bg-white/20 p-2 backdrop-blur-sm">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">100%</div>
                <p className="text-xs text-white/80">System active</p>
              </CardContent>
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mb-6 overflow-hidden border-0 shadow-xl">
            <CardHeader className="bg-theme-gradient-r text-white">
              <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
              <CardDescription className="text-blue-100">
                Access frequently used master forms
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
              <Link href="/masters/roll-master" className="group">
                <div className="relative overflow-hidden rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6 transition-all duration-300 hover:scale-105 hover:border-blue-400 hover:shadow-2xl">
                  <div className="mb-4 flex justify-center">
                    <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-4 shadow-lg transition-transform group-hover:rotate-6">
                      <Scroll className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="mb-2 text-lg font-bold text-blue-900">Roll Master</h3>
                    <p className="mb-3 text-sm text-blue-700">Manage roll inventory</p>
                    <div className="flex items-center justify-center gap-1 text-xs font-semibold text-blue-600">
                      Open <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                  <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-blue-200/30" />
                </div>
              </Link>

              <Link href="/masters/tool-master" className="group">
                <div className="relative overflow-hidden rounded-xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 p-6 transition-all duration-300 hover:scale-105 hover:border-orange-400 hover:shadow-2xl">
                  <div className="mb-4 flex justify-center">
                    <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-4 shadow-lg transition-transform group-hover:rotate-6">
                      <Wrench className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="mb-2 text-lg font-bold text-orange-900">Tool Master</h3>
                    <p className="mb-3 text-sm text-orange-700">Manage printing tools</p>
                    <div className="flex items-center justify-center gap-1 text-xs font-semibold text-orange-600">
                      Open <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                  <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-orange-200/30" />
                </div>
              </Link>

              <Link href="/masters/material" className="group">
                <div className="relative overflow-hidden rounded-xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-6 transition-all duration-300 hover:scale-105 hover:border-gray-400 hover:shadow-2xl">
                  <div className="mb-4 flex justify-center">
                    <div className="rounded-2xl bg-gradient-to-br from-gray-500 to-gray-600 p-4 shadow-lg transition-transform group-hover:rotate-6">
                      <Package className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="mb-2 text-lg font-bold text-gray-900">Material Master</h3>
                    <p className="mb-3 text-sm text-gray-700">Coming soon</p>
                    <div className="flex items-center justify-center gap-1 text-xs font-semibold text-gray-600">
                      Open <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                  <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gray-200/30" />
                </div>
              </Link>
            </CardContent>
          </Card>

          {/* Getting Started */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-theme-gradient-r text-white">
              <CardTitle className="text-xl font-bold">Getting Started</CardTitle>
              <CardDescription className="text-indigo-100">
                Quick guide to using the ERP system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="group flex gap-4 rounded-xl border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-blue-100 p-4 transition-all hover:border-blue-300 hover:shadow-lg">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-base font-bold text-white shadow-md">
                  1
                </div>
                <div>
                  <h4 className="mb-1 font-bold text-blue-900">Roll Master</h4>
                  <p className="text-sm text-blue-800">
                    Add and manage film and paper roll inventory with detailed specifications.
                  </p>
                </div>
              </div>

              <div className="group flex gap-4 rounded-xl border-2 border-orange-100 bg-gradient-to-r from-orange-50 to-orange-100 p-4 transition-all hover:border-orange-300 hover:shadow-lg">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-base font-bold text-white shadow-md">
                  2
                </div>
                <div>
                  <h4 className="mb-1 font-bold text-orange-900">Tool Master</h4>
                  <p className="text-sm text-orange-800">
                    Track printing tools including plates, cylinders, and dies with auto-generated prefix codes.
                  </p>
                </div>
              </div>

              <div className="group flex gap-4 rounded-xl border-2 border-green-100 bg-gradient-to-r from-green-50 to-green-100 p-4 transition-all hover:border-green-300 hover:shadow-lg">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-600 text-base font-bold text-white shadow-md">
                  3
                </div>
                <div>
                  <h4 className="mb-1 font-bold text-green-900">Navigation</h4>
                  <p className="text-sm text-green-800">
                    Use the sidebar to access all master forms and manage your packaging operations efficiently.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
