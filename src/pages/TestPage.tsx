import React from 'react';
import { TestButtonsComponent } from '../components/profile/TestButtonsComponent';
import { SimplePilgrimagePlanner } from '../components/profile/SimplePilgrimagePlanner';
import { PilgrimagePlannerNoDnd } from '../components/profile/PilgrimagePlannerNoDnd';
import { PilgrimagePlannerControlsStub3 } from '../components/profile/PilgrimagePlannerControlsStub3';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Тестирование компонентов</h1>
        
        <div className="space-y-12">
          <section>
            <h2 className="text-xl font-semibold mb-4">Тестирование кнопок</h2>
            <TestButtonsComponent />
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Упрощённый планировщик</h2>
            <SimplePilgrimagePlanner />
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Оригинальный компонент БЕЗ DragDropContext</h2>
            <div className="border rounded-lg overflow-hidden">
              <PilgrimagePlannerNoDnd />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">ОРИГИНАЛЬНЫЙ компонент С DragDropContext</h2>
            <div className="border rounded-lg overflow-hidden">
              <PilgrimagePlannerControlsStub3 />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}