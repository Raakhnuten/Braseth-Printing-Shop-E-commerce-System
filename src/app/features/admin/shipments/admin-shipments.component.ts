import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ShipmentService } from '../../../core/services/shipment.service';
import { Shipment, ShipmentStatus } from '../../../core/models/shipping.model';

@Component({
  selector: 'app-admin-shipments',
  templateUrl: './admin-shipments.component.html',
  styleUrl: './admin-shipments.component.scss',
  imports: [PageHeaderComponent, LoadingSpinnerComponent, EmptyStateComponent, DatePipe, FormsModule],
})
export class AdminShipmentsComponent implements OnInit {
  private shipmentService = inject(ShipmentService);

  pageTitle = 'Manage Shipments';
  loading = signal(false);
  error = signal('');
  shipments = signal<Shipment[]>([]);
  searchTerm = signal('');
  statusFilter = signal('');

  shipmentStatuses = Object.values(ShipmentStatus);

  selectedShipment = signal<Shipment | null>(null);
  showDetailDialog = signal(false);
  editTracking = signal('');
  editStatus = signal('');
  dialogMessage = signal('');

  filteredShipments = computed(() => {
    let result = this.shipments();
    const search = this.searchTerm().toLowerCase().trim();
    if (search) {
      result = result.filter((s) =>
        s.shipmentNumber.toLowerCase().includes(search) ||
        (s.trackingNumber ?? '').toLowerCase().includes(search) ||
        (s.carrierName ?? '').toLowerCase().includes(search) ||
        s.orderId.toLowerCase().includes(search)
      );
    }
    const status = this.statusFilter();
    if (status) result = result.filter((s) => s.status === status);
    return result;
  });

  ngOnInit(): void { this.loadShipments(); }

  loadShipments(): void {
    this.loading.set(true);
    this.error.set('');
    this.shipmentService.getShipments().subscribe({
      next: (res) => { this.shipments.set(res.data); this.loading.set(false); },
      error: () => { this.error.set('Failed to load shipments'); this.loading.set(false); },
    });
  }

  openDetail(shipment: Shipment): void {
    this.selectedShipment.set(shipment);
    this.editTracking.set(shipment.trackingNumber ?? '');
    this.editStatus.set(shipment.status);
    this.dialogMessage.set('');
    this.showDetailDialog.set(true);
  }

  closeDetail(): void { this.showDetailDialog.set(false); this.selectedShipment.set(null); }

  updateTracking(): void {
    const s = this.selectedShipment();
    if (!s) return;
    this.shipmentService.updateTrackingNumber(s.id, this.editTracking()).subscribe({
      next: (res) => {
        this.dialogMessage.set('Tracking updated');
        if (res.data) this.selectedShipment.set(res.data);
        this.loadShipments();
      },
      error: () => this.dialogMessage.set('Failed to update tracking'),
    });
  }

  updateStatus(): void {
    const s = this.selectedShipment();
    if (!s) return;
    this.shipmentService.updateShipmentStatus(s.id, this.editStatus() as ShipmentStatus).subscribe({
      next: (res) => {
        this.dialogMessage.set(`Status updated to ${this.editStatus()}`);
        if (res.data) this.selectedShipment.set(res.data);
        this.loadShipments();
      },
      error: () => this.dialogMessage.set('Failed to update status'),
    });
  }

  markDelivered(): void {
    const s = this.selectedShipment();
    if (!s) return;
    this.shipmentService.markAsDelivered(s.id).subscribe({
      next: (res) => {
        this.dialogMessage.set('Marked as delivered');
        if (res.data) this.selectedShipment.set(res.data);
        this.loadShipments();
      },
      error: () => this.dialogMessage.set('Failed to mark as delivered'),
    });
  }

  getStatusClass(status: string): string {
    return 'status-' + status.toLowerCase().replace(/_/g, '-');
  }
}
