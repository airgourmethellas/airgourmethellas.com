import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MenuItem } from '@shared/schema';
import Header from "@/components/header";
import { useLanguage } from '@/hooks/use-language';

export default function MenuPage() {
  const { t } = useLanguage();
  const { data: menuItems, isLoading, error } = useQuery<MenuItem[]>({
    queryKey: ['/api/menu-items'],
    retry: 3,
    staleTime: 300000, // 5 minutes
  });

  const [activeCategory, setActiveCategory] = React.useState<string>("all");
  
  // Group items by category
  const categories = React.useMemo(() => {
    if (!menuItems) return {};
    
    const result: Record<string, MenuItem[]> = {};
    
    menuItems.forEach(item => {
      if (!result[item.category]) {
        result[item.category] = [];
      }
      result[item.category].push(item);
    });
    
    return result;
  }, [menuItems]);
  
  const categoryNames = React.useMemo(() => {
    return {
      "breakfast": t('menu.categories.breakfast'),
      "appetizer": t('menu.categories.starters'),
      "salad": t('menu.categories.salads'),
      "soup": t('menu.categories.soups'),
      "main": t('menu.categories.mainCourses'),
      "dessert": t('menu.categories.desserts'),
      "beverage": t('menu.categories.beverages'),
      "special_diet": t('menu.categories.specialDiet')
    };
  }, [t]);
  
  // Get all available dietary options
  const dietaryOptions = React.useMemo(() => {
    if (!menuItems) return [];
    
    const options = new Set<string>();
    
    menuItems.forEach(item => {
      if (item.dietaryOptions) {
        item.dietaryOptions.forEach(option => options.add(option));
      }
    });
    
    return Array.from(options);
  }, [menuItems]);
  
  const filteredItems = React.useMemo(() => {
    if (activeCategory === "all") {
      return menuItems || [];
    }
    
    return (menuItems || []).filter(item => item.category === activeCategory);
  }, [menuItems, activeCategory]);

  if (isLoading) {
    return (
      <div className="container mx-auto my-8 p-4">
        <Header />
        <h1 className="text-2xl font-bold mt-8 mb-4">{t('menu.loading')}</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto my-8 p-4">
        <Header />
        <h1 className="text-2xl font-bold mt-8 mb-4">{t('menu.errorLoading')}</h1>
        <p className="text-red-500">{(error as Error).message}</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto my-8 p-4">
      <Header />
      
      <h1 className="text-3xl font-bold mt-8 mb-4 text-center text-blue-800">{t('menu.title')}</h1>
      
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full mt-8">
        <TabsList className="flex flex-wrap justify-center gap-2 mb-8">
          <TabsTrigger value="all">{t('menu.allItems')} ({menuItems?.length || 0})</TabsTrigger>
          {Object.keys(categories).sort().map(category => (
            <TabsTrigger key={category} value={category}>
              {categoryNames[category as keyof typeof categoryNames] || category} ({categories[category].length})
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value={activeCategory} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <Card key={item.id} className="overflow-hidden">
                <CardHeader className="bg-blue-50 pb-2">
                  <CardTitle className="text-lg font-semibold">{item.name}</CardTitle>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.dietaryOptions?.map(option => (
                      <Badge variant="outline" key={option} className="text-xs">
                        {option}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <div className="flex flex-col gap-2 mt-4">
                    {/* Only showing locations without prices */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{t('menu.locations.thessaloniki')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{t('menu.locations.mykonos')}</span>
                    </div>
                    {item.unit && (
                      <div className="text-xs text-gray-500 mt-1">
                        {item.unit}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}